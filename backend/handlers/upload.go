package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"

	"medical-dashboard/database"
	"medical-dashboard/models"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
)

func UploadExcel(c *gin.Context) {
	file, header, err := c.Request.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded"})
		return
	}
	defer file.Close()

	if !strings.HasSuffix(strings.ToLower(header.Filename), ".xlsx") {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only .xlsx files are supported"})
		return
	}

	f, err := excelize.OpenReader(file)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse Excel file"})
		return
	}
	defer f.Close()

	sheetName := f.GetSheetName(0)
	rows, err := f.GetRows(sheetName)
	if err != nil || len(rows) < 2 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Excel file is empty or has no data rows"})
		return
	}

	// Create upload record
	upload := models.Upload{
		Filename: header.Filename,
		RowCount: len(rows) - 1,
	}
	database.DB.Create(&upload)

	// Parse header row to find column indices
	headerRow := rows[0]
	colMap := make(map[string]int)
	for i, h := range headerRow {
		colMap[strings.TrimSpace(strings.ToLower(h))] = i
	}

	var reactions []models.DrugReaction
	for _, row := range rows[1:] {
		r := models.DrugReaction{
			UploadID:         upload.ID,
			PatientID:        getCol(row, colMap, "patient_id"),
			PatientAge:       atoi(getCol(row, colMap, "patient_age")),
			PatientGender:    getCol(row, colMap, "patient_gender"),
			PatientWeight:    atof(getCol(row, colMap, "patient_weight")),
			DrugName:         getCol(row, colMap, "drug_name"),
			DrugClass:        getCol(row, colMap, "drug_class"),
			Dosage:           getCol(row, colMap, "dosage"),
			RouteOfAdmin:     getCol(row, colMap, "route_of_admin"),
			ReactionType:     getCol(row, colMap, "reaction_type"),
			ReactionSeverity: getCol(row, colMap, "reaction_severity"),
			ReactionDate:     parseDate(getCol(row, colMap, "reaction_date")),
			OnsetDays:        atoi(getCol(row, colMap, "onset_days")),
			Outcome:          getCol(row, colMap, "outcome"),
			ReporterType:     getCol(row, colMap, "reporter_type"),
			FacilityState:    getCol(row, colMap, "facility_state"),
			MeddraTerm:       getCol(row, colMap, "meddra_term"),
			IsSerious:        getCol(row, colMap, "is_serious") == "Yes",
			RequiredHospital: getCol(row, colMap, "required_hospital") == "Yes",
		}
		reactions = append(reactions, r)
	}

	// Batch insert in chunks of 500
	for i := 0; i < len(reactions); i += 500 {
		end := i + 500
		if end > len(reactions) {
			end = len(reactions)
		}
		database.DB.Create(reactions[i:end])
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   fmt.Sprintf("Successfully uploaded %d records", len(reactions)),
		"upload_id": upload.ID,
		"row_count": len(reactions),
	})
}

func GetRecentUploads(c *gin.Context) {
	var uploads []models.Upload
	database.DB.Order("created_at desc").Limit(20).Find(&uploads)
	c.JSON(http.StatusOK, uploads)
}

func DeleteUpload(c *gin.Context) {
	id := c.Param("id")
	database.DB.Where("upload_id = ?", id).Delete(&models.DrugReaction{})
	database.DB.Delete(&models.Upload{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "Upload deleted"})
}

func getCol(row []string, colMap map[string]int, key string) string {
	if idx, ok := colMap[key]; ok && idx < len(row) {
		return strings.TrimSpace(row[idx])
	}
	return ""
}

func atoi(s string) int {
	v, _ := strconv.Atoi(s)
	return v
}

func atof(s string) float64 {
	v, _ := strconv.ParseFloat(s, 64)
	return v
}

func parseDate(s string) time.Time {
	for _, layout := range []string{"2006-01-02", "01/02/2006", "1/2/2006", "2006-01-02T15:04:05"} {
		if t, err := time.Parse(layout, s); err == nil {
			return t
		}
	}
	return time.Time{}
}
