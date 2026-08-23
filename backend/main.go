package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"os/exec"
	"runtime"

	"medical-dashboard/database"
	"medical-dashboard/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

//go:embed static/*
var frontendFS embed.FS

func main() {
	database.Connect()

	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// API routes
	r.POST("/api/login", handlers.Login)

	api := r.Group("/api")
	api.Use(handlers.AuthMiddleware())
	{
		api.POST("/logout", handlers.Logout)
		api.POST("/upload", handlers.UploadExcel)
		api.GET("/uploads", handlers.GetRecentUploads)
		api.DELETE("/uploads/:id", handlers.DeleteUpload)

		api.GET("/analytics/summary", handlers.GetSummary)
		api.GET("/analytics/by-drug", handlers.GetReactionsByDrug)
		api.GET("/analytics/by-severity", handlers.GetReactionsBySeverity)
		api.GET("/analytics/by-outcome", handlers.GetReactionsByOutcome)
		api.GET("/analytics/by-gender", handlers.GetReactionsByGender)
		api.GET("/analytics/by-type", handlers.GetReactionsByType)
		api.GET("/analytics/by-state", handlers.GetReactionsByState)
		api.GET("/analytics/by-month", handlers.GetReactionsByMonth)
		api.GET("/analytics/by-age", handlers.GetAgeDistribution)
		api.GET("/analytics/by-drug-class", handlers.GetDrugClassBreakdown)
		api.GET("/analytics/serious", handlers.GetSeriousVsNonSerious)
	}

	// Serve embedded React frontend
	staticFS, err := fs.Sub(frontendFS, "static")
	if err != nil {
		log.Fatal(err)
	}
	fileServer := http.FileServer(http.FS(staticFS))

	r.NoRoute(func(c *gin.Context) {
		// Try serving the exact file first
		path := c.Request.URL.Path
		if path == "/" {
			path = "/index.html"
		}
		f, err := staticFS.Open(path[1:]) // strip leading /
		if err == nil {
			f.Close()
			fileServer.ServeHTTP(c.Writer, c.Request)
			return
		}
		// SPA fallback: serve index.html for client-side routes
		c.Request.URL.Path = "/"
		fileServer.ServeHTTP(c.Writer, c.Request)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	url := "http://localhost:" + port
	log.Println("============================================")
	log.Println("  Drug Reaction Dashboard")
	log.Printf("  Running at: %s", url)
	log.Println("  Login: admin / admin")
	log.Println("  Press Ctrl+C to stop")
	log.Println("============================================")

	// Auto-open browser
	openBrowser(url)

	r.Run(":" + port)
}

func openBrowser(url string) {
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "windows":
		cmd = exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	case "darwin":
		cmd = exec.Command("open", url)
	default:
		cmd = exec.Command("xdg-open", url)
	}
	cmd.Start()
}
