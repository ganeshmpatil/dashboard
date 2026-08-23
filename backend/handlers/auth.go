package handlers

import (
	"net/http"
	"sync"
	"time"

	"medical-dashboard/database"
	"medical-dashboard/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

var (
	sessions = make(map[string]string)
	mu       sync.RWMutex
)

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Username and password required"})
		return
	}

	var user models.User
	if err := database.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	// Support both plain text (seeded) and bcrypt passwords
	if user.Password != req.Password {
		if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}
	}

	token := generateToken()
	mu.Lock()
	sessions[token] = user.Username
	mu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"token":    token,
		"username": user.Username,
	})
}

func Logout(c *gin.Context) {
	token := c.GetHeader("Authorization")
	mu.Lock()
	delete(sessions, token)
	mu.Unlock()
	c.JSON(http.StatusOK, gin.H{"message": "Logged out"})
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Authorization required"})
			return
		}
		mu.RLock()
		username, ok := sessions[token]
		mu.RUnlock()
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid session"})
			return
		}
		c.Set("username", username)
		c.Next()
	}
}

func generateToken() string {
	return time.Now().Format("20060102150405.000000000")
}
