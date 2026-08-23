package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Username string `gorm:"uniqueIndex;not null" json:"username"`
	Password string `gorm:"not null" json:"-"`
}

type Upload struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	Filename  string         `gorm:"not null" json:"filename"`
	RowCount  int            `json:"row_count"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

type DrugReaction struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	UploadID           uint      `gorm:"index;not null" json:"upload_id"`
	PatientID          string    `json:"patient_id"`
	PatientAge         int       `json:"patient_age"`
	PatientGender      string    `json:"patient_gender"`
	PatientWeight      float64   `json:"patient_weight"`
	DrugName           string    `gorm:"index" json:"drug_name"`
	DrugClass          string    `json:"drug_class"`
	Dosage             string    `json:"dosage"`
	RouteOfAdmin       string    `json:"route_of_admin"`
	ReactionType       string    `gorm:"index" json:"reaction_type"`
	ReactionSeverity   string    `gorm:"index" json:"reaction_severity"`
	ReactionDate       time.Time `json:"reaction_date"`
	OnsetDays          int       `json:"onset_days"`
	Outcome            string    `gorm:"index" json:"outcome"`
	ReporterType       string    `json:"reporter_type"`
	FacilityState      string    `json:"facility_state"`
	MeddraTerm         string    `json:"meddra_term"`
	IsSerious          bool      `json:"is_serious"`
	RequiredHospital   bool      `json:"required_hospital"`
}
