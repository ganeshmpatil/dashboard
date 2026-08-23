package main

import (
	"log"
	"os"

	"medical-dashboard/database"
	"medical-dashboard/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	database.Connect()

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
	}))

	// Public routes
	r.POST("/api/login", handlers.Login)

	// Protected routes
	api := r.Group("/api")
	api.Use(handlers.AuthMiddleware())
	{
		api.POST("/logout", handlers.Logout)
		api.POST("/upload", handlers.UploadExcel)
		api.GET("/uploads", handlers.GetRecentUploads)
		api.DELETE("/uploads/:id", handlers.DeleteUpload)

		// Analytics
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

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}
