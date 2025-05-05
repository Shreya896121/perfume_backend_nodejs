sql.query(`
  SELECT p.*, COUNT(po.order_id) as order_count
  FROM perfumes p
  LEFT JOIN perfume_orders po ON p.id = po.perfume_id
  GROUP BY p.id, p.name 
  ORDER BY order_count DESC
`, (err, res) => {
  if (err) {
    console.log("error: ", err);
    result(null, err);
    return;
  }
  
  enrichPerfumesWithBrands(res, (err, enrichedPerfumes) => {
    if (err) {
      result(err, null);
      return;
    }
    console.log("most ordered perfumes: ", enrichedPerfumes);
    result(null, enrichedPerfumes);
  });
});