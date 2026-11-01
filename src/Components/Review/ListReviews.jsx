const ListReviews = ({ reviews = [], averageRating = 0, reviewCount = 0 }) => {
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const safeAverageRating = Number(averageRating) || 0;
  const safeReviewCount = Number(reviewCount) || safeReviews.length;

  return (
    <section className="filter-panel product-reviews" aria-labelledby="reviews-title">
      <div className="eyebrow">Customer feedback</div>
      <div className="product-reviews-head">
        <div>
          <h2 id="reviews-title">Reviews</h2>
          <p className="muted">
            {safeReviewCount} {safeReviewCount === 1 ? "review" : "reviews"}
          </p>
        </div>
        {safeReviewCount > 0 && (
          <strong className="product-review-summary">
            {"★".repeat(Math.max(0, Math.min(5, Math.round(safeAverageRating))))}{" "}
            {safeAverageRating.toFixed(1)} / 5
          </strong>
        )}
      </div>
      {safeReviews.length ? (
        <div className="product-review-list">
          {safeReviews.map((review, index) => {
            const rating = Math.max(0, Math.min(5, Number(review?.rating) || 0));
            return (
              <article
                className="product-review"
                key={review?._id || `${review?.user || "review"}-${index}`}
              >
                <div className="product-review-meta">
                  <strong>{review?.name || "Customer"}</strong>
                  <span className="product-review-rating" aria-label={`${rating} out of 5 stars`}>
                    {"★".repeat(rating)}
                    {"☆".repeat(5 - rating)}
                  </span>
                </div>
                <p>{review?.comment || "No comment provided."}</p>
              </article>
            );
          })}
        </div>
      ) : (
        <p className="muted">No reviews yet. Be the first to review this product.</p>
      )}
    </section>
  );
};

export default ListReviews;
