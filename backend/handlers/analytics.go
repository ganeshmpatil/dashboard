package handlers

import (
	"net/http"

	"medical-dashboard/database"
	"medical-dashboard/models"

	"github.com/gin-gonic/gin"
)

type CountResult struct {
	Label string `json:"label"`
	Count int    `json:"count"`
}

func GetSummary(c *gin.Context) {
	var totalReactions int64
	var totalUploads int64
	var totalPatients int64

	database.DB.Model(&models.DrugReaction{}).Count(&totalReactions)
	database.DB.Model(&models.Upload{}).Count(&totalUploads)
	database.DB.Model(&models.DrugReaction{}).Distinct("patient_id").Count(&totalPatients)

	var severityCounts []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select("reaction_severity as label, count(*) as count").
		Group("reaction_severity").
		Order("count desc").
		Scan(&severityCounts)

	c.JSON(http.StatusOK, gin.H{
		"total_reactions":    totalReactions,
		"total_uploads":     totalUploads,
		"total_patients":    totalPatients,
		"severity_breakdown": severityCounts,
	})
}

func GetReactionsByDrug(c *gin.Context) {
	var results []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select("drug_name as label, count(*) as count").
		Group("drug_name").
		Order("count desc").
		Limit(15).
		Scan(&results)
	c.JSON(http.StatusOK, results)
}

func GetReactionsBySeverity(c *gin.Context) {
	var results []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select("reaction_severity as label, count(*) as count").
		Group("reaction_severity").
		Order("count desc").
		Scan(&results)
	c.JSON(http.StatusOK, results)
}

func GetReactionsByOutcome(c *gin.Context) {
	var results []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select("outcome as label, count(*) as count").
		Group("outcome").
		Order("count desc").
		Scan(&results)
	c.JSON(http.StatusOK, results)
}

func GetReactionsByGender(c *gin.Context) {
	var results []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select("patient_gender as label, count(*) as count").
		Group("patient_gender").
		Scan(&results)
	c.JSON(http.StatusOK, results)
}

func GetReactionsByType(c *gin.Context) {
	var results []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select("reaction_type as label, count(*) as count").
		Group("reaction_type").
		Order("count desc").
		Limit(10).
		Scan(&results)
	c.JSON(http.StatusOK, results)
}

func GetReactionsByState(c *gin.Context) {
	var results []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select("facility_state as label, count(*) as count").
		Group("facility_state").
		Order("count desc").
		Limit(10).
		Scan(&results)
	c.JSON(http.StatusOK, results)
}

func GetReactionsByMonth(c *gin.Context) {
	var results []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select("strftime('%Y-%m', reaction_date) as label, count(*) as count").
		Where("reaction_date > '2000-01-01'").
		Group("label").
		Order("label").
		Scan(&results)
	c.JSON(http.StatusOK, results)
}

func GetAgeDistribution(c *gin.Context) {
	var results []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select(`CASE
			WHEN patient_age < 18 THEN '0-17'
			WHEN patient_age < 30 THEN '18-29'
			WHEN patient_age < 45 THEN '30-44'
			WHEN patient_age < 60 THEN '45-59'
			WHEN patient_age < 75 THEN '60-74'
			ELSE '75+' END as label, count(*) as count`).
		Group("label").
		Order("label").
		Scan(&results)
	c.JSON(http.StatusOK, results)
}

func GetDrugClassBreakdown(c *gin.Context) {
	var results []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select("drug_class as label, count(*) as count").
		Group("drug_class").
		Order("count desc").
		Limit(10).
		Scan(&results)
	c.JSON(http.StatusOK, results)
}

func GetSeriousVsNonSerious(c *gin.Context) {
	var results []CountResult
	database.DB.Model(&models.DrugReaction{}).
		Select(`CASE WHEN is_serious = 1 THEN 'Serious' ELSE 'Non-Serious' END as label, count(*) as count`).
		Group("label").
		Scan(&results)
	c.JSON(http.StatusOK, results)
}
