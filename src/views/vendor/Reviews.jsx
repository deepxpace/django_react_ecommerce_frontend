import React, { useState, useEffect } from "react";
import apiInstance from "../../utils/axios";
import Sidebar from "./Sidebar";
import UserData from "../plugin/UserData";
import moment from "moment";

function Reviews() {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [filteredReviews, setFilteredReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    rating: null,
    product: null,
    startDate: null,
    endDate: null,
  });

  const userData = UserData();

  // New state for replies
  const [replyTexts, setReplyTexts] = useState({});
  const [replyErrors, setReplyErrors] = useState({});

  // Unique collections for filtering
  const [uniqueProducts, setUniqueProducts] = useState([]);
  const [groupedReviews, setGroupedReviews] = useState({});

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await apiInstance.get(
          `vendor-reviews/${userData?.vendor_id}/`
        );

        // Enhance reviews with reply state
        const enhancedReviews = response.data.map((review) => ({
          ...review,
          replies: review.reply
            ? [{ text: review.reply, createdAt: new Date() }]
            : [],
        }));

        setReviews(enhancedReviews);

        // Extract unique products
        const products = [
          ...new Set(enhancedReviews.map((review) => review.product.title)),
        ];
        setUniqueProducts(products);

        // Group reviews by product
        const grouped = enhancedReviews.reduce((acc, review) => {
          const productTitle = review.product.title;
          if (!acc[productTitle]) {
            acc[productTitle] = {
              product: review.product,
              reviews: [],
            };
          }
          acc[productTitle].reviews.push(review);
          return acc;
        }, {});
        setGroupedReviews(grouped);
        setFilteredReviews(enhancedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };

    fetchReviews();
  }, []);

  // Apply filters
  const applyFilters = () => {
    let result = [...reviews];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (review) =>
          review.review.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.profile.full_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    // Rating filter
    if (filters.rating) {
      result = result.filter((review) => review.rating === filters.rating);
    }

    // Product filter
    if (filters.product) {
      result = result.filter(
        (review) => review.product.title === filters.product
      );
    }

    // Date filters
    if (filters.startDate) {
      result = result.filter((review) =>
        moment(review.date).isSameOrAfter(moment(filters.startDate))
      );
    }

    if (filters.endDate) {
      result = result.filter((review) =>
        moment(review.date).isSameOrBefore(moment(filters.endDate))
      );
    }

    setFilteredReviews(result);
  };

  // Trigger filters when search or filters change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, filters]);

  // Render star rating
  const renderStarRating = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <i
        key={index}
        className={`fas fa-star ${
          index < rating ? "text-warning" : "text-muted"
        }`}
      />
    ));
  };

  // Calculate average rating
  const calculateAverageRating = (reviews) => {
    if (reviews.length === 0) return 0;
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (totalRating / reviews.length).toFixed(1);
  };

  const [currentPage, setCurrentPage] = useState({});

  const reviewsPerPage = 5;

  const paginateReviews = (reviews, productTitle) => {
    const page = currentPage[productTitle] || 1;
    const startIndex = (page - 1) * reviewsPerPage;
    return reviews.slice(startIndex, startIndex + reviewsPerPage);
  };

  const generatePagination = (totalReviews, productTitle) => {
    const totalPages = Math.ceil(totalReviews / reviewsPerPage);
    return [...Array(totalPages)].map((_, index) => (
      <li
        key={index}
        className={`page-item ${
          currentPage[productTitle] === index + 1 ? "active" : ""
        }`}
      >
        <button
          className="page-link"
          onClick={() =>
            setCurrentPage((prev) => ({ ...prev, [productTitle]: index + 1 }))
          }
        >
          {index + 1}
        </button>
      </li>
    ));
  };

  // Handle reply submission
  const handleReplySubmit = async (reviewId, productTitle) => {
    try {
      const replyText = replyTexts[reviewId];

      if (!replyText || replyText.trim() === "") {
        setReplyErrors((prev) => ({
          ...prev,
          [reviewId]: "Reply cannot be empty",
        }));
        return;
      }

      // API call to submit reply
      const response = await apiInstance.patch(
        `vendor-reviews/1/${reviewId}/`,
        {
          reply: replyText,
        }
      );

      // Update local state to show reply immediately
      const updatedReviews = reviews.map((review) =>
        review.id === reviewId
          ? {
              ...review,
              replies: [
                ...(review.replies || []),
                { text: replyText, createdAt: new Date() },
              ],
            }
          : review
      );

      setReviews(updatedReviews);

      // Reset reply input
      setReplyTexts((prev) => ({
        ...prev,
        [reviewId]: "",
      }));

      // Clear any previous errors
      setReplyErrors((prev) => ({
        ...prev,
        [reviewId]: null,
      }));

      // Update grouped reviews
      const updatedGroupedReviews = { ...groupedReviews };
      Object.keys(updatedGroupedReviews).forEach((key) => {
        updatedGroupedReviews[key].reviews = updatedGroupedReviews[
          key
        ].reviews.map((review) =>
          review.id === reviewId
            ? {
                ...review,
                replies: [
                  ...(review.replies || []),
                  { text: replyText, createdAt: new Date() },
                ],
              }
            : review
        );
      });
      setGroupedReviews(updatedGroupedReviews);
    } catch (error) {
      console.error("Error submitting reply:", error);
      setReplyErrors((prev) => ({
        ...prev,
        [reviewId]: "Failed to submit reply. Please try again.",
      }));
    }
  };

  return (
    <div className="container mt-3">
      <div className="row">
        {/* Sidebar Toggle Button */}
        <button
          className="btn btn-warning d-lg-none position-fixed top-0 start-0 mt-2 ms-2 z-3"
          onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}
          aria-label="Toggle sidebar"
        >
          <i className={`bi bi-${isSidebarCollapsed ? "list" : "x"}`}></i>
        </button>

        {/* Sidebar */}
        <div
          className={`col-lg-3 col-xl-2 pt-3 sidebar ${
            isSidebarCollapsed ? "d-none" : ""
          } d-lg-block`}
        >
          <Sidebar />
        </div>

        {/* Main Content */}
        <main className="col-lg-9 col-xl-10 ms-sm-auto px-4 pt-3">
          <div className="">
            {/* Sticky Filters */}
            <div className="card border p-3 mb-3">
              <div className="row g-2 align-items-center">
                <div className="col-lg-4 col-md-6">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search reviews..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="col-lg-2 col-md-3 col-6">
                  <select
                    className="form-select form-select-sm"
                    value={filters.rating || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        rating: e.target.value ? Number(e.target.value) : null,
                      }))
                    }
                  >
                    <option value="">All Ratings</option>
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating} ★
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-2 col-md-3 col-6">
                  <select
                    className="form-select form-select-sm"
                    value={filters.product || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        product: e.target.value || null,
                      }))
                    }
                  >
                    <option value="">All Products</option>
                    {uniqueProducts.map((product) => (
                      <option key={product} value={product}>
                        {product}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-lg-2 col-6">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={filters.startDate || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        startDate: e.target.value || null,
                      }))
                    }
                  />
                </div>
                <div className="col-lg-2 col-6">
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={filters.endDate || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        endDate: e.target.value || null,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Product Reviews with Accordion */}
            <div className="accordion" id="reviewsAccordion">
              {Object.entries(groupedReviews).map(
                ([productTitle, productData], index) => (
                  <div key={productTitle} className="accordion-item mb-3">
                    <h3 className="accordion-header">
                      <button
                        className="accordion-button bg-white fw-bold d-flex justify-content-between align-items-center text-truncate"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded="false"
                        aria-controls={`collapse${index}`}
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        <span
                          className="text-truncate"
                          style={{ maxWidth: "60%" }}
                        >
                          {productTitle}
                        </span>
                        <div className="d-flex align-items-center ms-auto text-nowrap">
                          <span className="fw-bold text-warning fs-6">
                            {calculateAverageRating(productData.reviews)}
                          </span>
                          <span className="ms-1">
                            {renderStarRating(
                              Math.round(
                                calculateAverageRating(productData.reviews)
                              )
                            )}
                          </span>
                          <small className="text-muted ms-2 d-none d-sm-inline">
                            ({productData.reviews.length}) Reviews
                          </small>
                        </div>
                      </button>
                    </h3>

                    <div
                      id={`collapse${index}`}
                      className="accordion-collapse collapse"
                      data-bs-parent="#reviewsAccordion"
                    >
                      <div className="accordion-body">
                        {/* Product Info (existing code) */}
                        <div className="row align-items-center mb-3">
                          <div className="col-lg-3 col-md-4">
                            <img
                              src={productData.product.image}
                              alt={productTitle}
                              className="img-fluid rounded"
                            />
                          </div>
                          <div className="col-lg-9 col-md-8 mt-2">
                            <p
                              className="mb-1"
                              style={{
                                display: "-webkit-box",
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                                WebkitLineClamp: 3,
                              }}
                            >
                              {productData.product.description}
                            </p>

                            <div className="row">
                              <div className="col-4">
                                <small className="text-muted">Price</small>
                                <p className="fw-bold m-0">
                                  ${productData.product.price}
                                </p>
                              </div>
                              <div className="col-4">
                                <small className="text-muted">Category</small>
                                <p className="fw-bold m-0">
                                  {productData.product.category.title}
                                </p>
                              </div>
                              <div className="col-4">
                                <small className="text-muted">Stock</small>
                                <p className="fw-bold m-0">
                                  {productData.product.stock_qty}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="list-group">
                          {paginateReviews(
                            productData.reviews,
                            productTitle
                          ).map((review) => (
                            <div
                              key={review.id}
                              className="list-group-item list-group-item-action p-3"
                            >
                              <div className="d-flex w-100 justify-content-between align-items-start">
                                <div className="d-flex align-items-center mb-2">
                                  <img
                                    src={review.profile.image}
                                    alt={review.profile.full_name}
                                    className="rounded-circle me-3"
                                    width={50}
                                    height={50}
                                    style={{ objectFit: "cover" }}
                                  />
                                  <div>
                                    <h6 className="mb-1 fw-bold">
                                      {review.profile.full_name}
                                    </h6>
                                    <small className="text-muted">
                                      {moment(review.date).format(
                                        "MMM D, YYYY"
                                      )}
                                    </small>
                                  </div>
                                </div>
                                <div className="text-warning">
                                  {renderStarRating(review.rating)}
                                </div>
                              </div>

                              <p className="mb-2 text-dark">{review.review}</p>

                              {/* Replies Section */}
                              {review.replies && review.replies.length > 0 && (
                                <div className="border card p-2 rounded mt-2 mb-2">
                                  <small className="text-muted fw-bold d-block mb-1">
                                    Your Replies:
                                  </small>
                                  {review.replies.map((reply, index) => (
                                    <div
                                      key={index}
                                      className="bg-white p-2 rounded mb-1"
                                    >
                                      <p
                                        className="mb-0 text-dark"
                                        style={{ fontSize: "0.9rem" }}
                                      >
                                        {reply.text}
                                      </p>
                                      <small className="text-muted">
                                        {moment(reply.createdAt).format(
                                          "MMM D, YYYY HH:mm"
                                        )}
                                      </small>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reply Input */}
                              <div className="reply-section mt-3">
                                <div className="input-group">
                                  <input
                                    type="text"
                                    className={`form-control form-control-md ${
                                      replyErrors[review.id] ? "is-invalid" : ""
                                    }`}
                                    placeholder="Write a reply..."
                                    value={replyTexts[review.id] || ""}
                                    onChange={(e) =>
                                      setReplyTexts((prev) => ({
                                        ...prev,
                                        [review.id]: e.target.value,
                                      }))
                                    }
                                  />
                                  <button
                                    className="btn btn-light btn-sm"
                                    onClick={() =>
                                      handleReplySubmit(review.id, productTitle)
                                    }
                                  >
                                    Reply
                                  </button>
                                </div>
                                {replyErrors[review.id] && (
                                  <div className="invalid-feedback d-block">
                                    {replyErrors[review.id]}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Pagination Controls */}
                        <nav className="mt-3">
                          <ul className="pagination pagination-sm justify-content-center">
                            {generatePagination(
                              productData.reviews.length,
                              productTitle
                            )}
                          </ul>
                        </nav>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Reviews;
