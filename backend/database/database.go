package database

import (
	"log"
	"os"
	"path/filepath"

	"medical-dashboard/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	dbPath := getDbPath()
	log.Printf("Using database: %s", dbPath)

	var err error
	DB, err = gorm.Open(sqlite.Open(dbPath), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	// SQLite performance tuning
	sqlDB, _ := DB.DB()
	sqlDB.Exec("PRAGMA journal_mode=WAL")
	sqlDB.Exec("PRAGMA synchronous=NORMAL")
	sqlDB.Exec("PRAGMA cache_size=10000")

	log.Println("Database connected successfully")

	DB.AutoMigrate(&models.User{}, &models.Upload{}, &models.DrugReaction{})

	seedAdmin()
}

func seedAdmin() {
	var count int64
	DB.Model(&models.User{}).Count(&count)
	if count == 0 {
		admin := models.User{
			Username: "admin",
			Password: "admin",
		}
		DB.Create(&admin)
		log.Println("Admin user seeded")
	}
}

func getDbPath() string {
	// Store DB next to the executable
	exe, err := os.Executable()
	if err != nil {
		return "dashboard.db"
	}
	return filepath.Join(filepath.Dir(exe), "dashboard.db")
}
