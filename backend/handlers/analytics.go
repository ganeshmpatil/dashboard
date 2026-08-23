package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"medical-dashboard/database"
	"medical-dashboard/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Allowlisted fields for dynamic queries (prevents SQL injection)
var allowedFields = map[string]string{
	"drug_name":         "drug_name",
	"drug_class":        "drug_class",
	"reaction_type":     "reaction_type",
	"reaction_severity": "reaction_severity",
	"outcome":           "outcome",
	"patient_gender":    "patient_gender",
	"reporter_type":     "reporter_type",
	"facility_state":    "facility_state",
	"route_of_admin":    "route_of_admin",
	"meddra_term":       "meddra_term",
	"is_serious":        "CASE WHEN is_serious = 1 THEN 'Serious' ELSE 'Non-Serious' END",
	"required_hospital": "CASE WHEN required_hospital = 1 THEN 'Hospitalized' ELSE 'Not Hospitalized' END",
	"age_group":         "CASE WHEN patient_age < 18 THEN '0-17' WHEN patient_age < 30 THEN '18-29' WHEN patient_age < 45 THEN '30-44' WHEN patient_age < 60 THEN '45-59' WHEN patient_age < 75 THEN '60-74' ELSE '75+' END",
	"month":             "strftime('%Y-%m', reaction_date)",
	"onset_bucket":      "CASE WHEN onset_days <= 1 THEN '0-1 days' WHEN onset_days <= 7 THEN '2-7 days' WHEN onset_days <= 30 THEN '8-30 days' ELSE '31+ days' END",
}

var allowedMetrics = map[string]string{
	"count":      "count(*)",
	"avg_age":    "ROUND(avg(patient_age), 1)",
	"avg_weight": "ROUND(avg(patient_weight), 1)",
	"avg_onset":  "ROUND(avg(onset_days), 1)",
	"patients":   "count(DISTINCT patient_id)",
}

func applyFilters(c *gin.Context, q *gorm.DB) *gorm.DB {
	if uid := c.Query("upload_id"); uid != "" {
		q = q.Where("upload_id = ?", uid)
	}
	for _, f := range []string{"drug_name", "drug_class", "reaction_severity", "outcome", "patient_gender", "facility_state", "route_of_admin", "reporter_type"} {
		if v := c.Query(f); v != "" {
			q = q.Where(fmt.Sprintf("%s = ?", f), v)
		}
	}
	if v := c.Query("is_serious"); v != "" {
		q = q.Where("is_serious = ?", v == "true" || v == "1")
	}
	if v := c.Query("date_from"); v != "" {
		q = q.Where("reaction_date >= ?", v)
	}
	if v := c.Query("date_to"); v != "" {
		q = q.Where("reaction_date <= ?", v)
	}
	return q
}

// GET /api/analytics/query?group_by=drug_name&metric=count&limit=10&order=desc&upload_id=1&...filters
func DynamicQuery(c *gin.Context) {
	groupBy := c.DefaultQuery("group_by", "drug_name")
	metric := c.DefaultQuery("metric", "count")
	limitStr := c.DefaultQuery("limit", "20")
	order := c.DefaultQuery("order", "desc")

	groupExpr, ok := allowedFields[groupBy]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid group_by field", "allowed": keys(allowedFields)})
		return
	}
	metricExpr, ok := allowedMetrics[metric]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid metric", "allowed": keys(allowedMetrics)})
		return
	}

	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 100 {
		limit = 20
	}

	orderDir := "DESC"
	if strings.ToLower(order) == "asc" {
		orderDir = "ASC"
	}

	type Result struct {
		Label string  `json:"label"`
		Value float64 `json:"value"`
	}
	var results []Result

	q := applyFilters(c, database.DB.Model(&models.DrugReaction{}))
	q.Select(fmt.Sprintf("%s as label, %s as value", groupExpr, metricExpr)).
		Group("label").
		Order(fmt.Sprintf("value %s", orderDir)).
		Limit(limit).
		Scan(&results)

	c.JSON(http.StatusOK, results)
}

// GET /api/analytics/cross?row=drug_name&col=reaction_severity&metric=count&upload_id=1
func CrossTabQuery(c *gin.Context) {
	rowField := c.DefaultQuery("row", "drug_name")
	colField := c.DefaultQuery("col", "reaction_severity")
	metric := c.DefaultQuery("metric", "count")
	limitStr := c.DefaultQuery("limit", "10")

	rowExpr, ok1 := allowedFields[rowField]
	colExpr, ok2 := allowedFields[colField]
	metricExpr, ok3 := allowedMetrics[metric]
	if !ok1 || !ok2 || !ok3 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid field or metric"})
		return
	}

	limit, _ := strconv.Atoi(limitStr)
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	type CrossResult struct {
		Row   string  `json:"row"`
		Col   string  `json:"col"`
		Value float64 `json:"value"`
	}
	var results []CrossResult

	q := applyFilters(c, database.DB.Model(&models.DrugReaction{}))
	q.Select(fmt.Sprintf("%s as row, %s as col, %s as value", rowExpr, colExpr, metricExpr)).
		Group("row, col").
		Order(fmt.Sprintf("row %s", "ASC")).
		Scan(&results)

	// Pivot: get top N rows by total value
	rowTotals := map[string]float64{}
	for _, r := range results {
		rowTotals[r.Row] += r.Value
	}
	type kv struct {
		K string
		V float64
	}
	var sorted []kv
	for k, v := range rowTotals {
		sorted = append(sorted, kv{k, v})
	}
	for i := 0; i < len(sorted); i++ {
		for j := i + 1; j < len(sorted); j++ {
			if sorted[j].V > sorted[i].V {
				sorted[i], sorted[j] = sorted[j], sorted[i]
			}
		}
	}
	topRows := map[string]bool{}
	for i, s := range sorted {
		if i >= limit {
			break
		}
		topRows[s.K] = true
	}

	// Collect unique columns
	colSet := map[string]bool{}
	for _, r := range results {
		colSet[r.Col] = true
	}
	var columns []string
	for col := range colSet {
		columns = append(columns, col)
	}

	// Build pivoted data
	var pivoted []map[string]interface{}
	for _, s := range sorted {
		if !topRows[s.K] {
			continue
		}
		row := map[string]interface{}{"name": s.K}
		for _, r := range results {
			if r.Row == s.K {
				row[r.Col] = r.Value
			}
		}
		pivoted = append(pivoted, row)
	}

	c.JSON(http.StatusOK, gin.H{
		"columns": columns,
		"data":    pivoted,
	})
}

func GetSummary(c *gin.Context) {
	q := func() *gorm.DB { return applyFilters(c, database.DB.Model(&models.DrugReaction{})) }

	var totalReactions, totalPatients, seriousCount, fatalCount, hospitalCount int64
	var avgAge, avgOnset float64

	q().Count(&totalReactions)
	q().Distinct("patient_id").Count(&totalPatients)
	q().Where("is_serious = 1").Count(&seriousCount)
	q().Where("outcome = 'Fatal'").Count(&fatalCount)
	q().Where("required_hospital = 1").Count(&hospitalCount)
	q().Select("COALESCE(avg(patient_age), 0)").Row().Scan(&avgAge)
	q().Select("COALESCE(avg(onset_days), 0)").Row().Scan(&avgOnset)

	var totalUploads int64
	database.DB.Model(&models.Upload{}).Count(&totalUploads)

	var severityCounts []struct {
		Label string `json:"label"`
		Count int    `json:"count"`
	}
	q().Select("reaction_severity as label, count(*) as count").
		Group("reaction_severity").Order("count desc").Scan(&severityCounts)

	seriousPct := float64(0)
	if totalReactions > 0 {
		seriousPct = float64(seriousCount) / float64(totalReactions) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"total_reactions":    totalReactions,
		"total_uploads":     totalUploads,
		"total_patients":    totalPatients,
		"serious_count":     seriousCount,
		"serious_pct":       seriousPct,
		"fatal_count":       fatalCount,
		"hospital_count":    hospitalCount,
		"avg_age":           avgAge,
		"avg_onset":         avgOnset,
		"severity_breakdown": severityCounts,
	})
}

// GET /api/analytics/fields - returns available fields and metrics for UI dropdowns
func GetFields(c *gin.Context) {
	var fields []map[string]string
	for k := range allowedFields {
		fields = append(fields, map[string]string{"value": k, "label": humanize(k)})
	}
	var metrics []map[string]string
	for k := range allowedMetrics {
		metrics = append(metrics, map[string]string{"value": k, "label": humanize(k)})
	}
	c.JSON(http.StatusOK, gin.H{"fields": fields, "metrics": metrics})
}

func keys(m map[string]string) []string {
	var ks []string
	for k := range m {
		ks = append(ks, k)
	}
	return ks
}

func humanize(s string) string {
	s = strings.ReplaceAll(s, "_", " ")
	if len(s) > 0 {
		s = strings.ToUpper(s[:1]) + s[1:]
	}
	return s
}
