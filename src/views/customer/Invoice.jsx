import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import UserData from "../plugin/UserData";
import apiInstance from "../../utils/axios";
import moment from "moment";

function Invoice() {
  const [order, setOrder] = useState({});
  const [orderItems, setOrderItems] = useState([]);

  const userData = UserData();
  const param = useParams();

  useEffect(() => {
    apiInstance
      .get(`customer/order/${userData?.user_id}/${param.order_oid}/`)
      .then((res) => {
        setOrder(res.data);
        setOrderItems(res.data.orderitem);
      });
  }, []);

  const groupByVendor = (items) => {
    return items.reduce((acc, item) => {
      const vendorId = item.vendor.id;
      if (!acc[vendorId]) {
        acc[vendorId] = { vendor: item.vendor, items: [] };
      }
      acc[vendorId].items.push(item);
      return acc;
    }, {});
  };

  const calculateSavings = (item) => {
    const discount = item.coupon.length > 0 ? item.coupon[0].discount : 0;
    return parseFloat(item.saved || 0).toFixed(2);
  };

  const handlePrint = () => {
    window.print();
  };

  const vendorGroups = groupByVendor(orderItems);

  const InvoiceContent = () => (
    <div className="invoice-content">
      {/* Header Section */}
      <div className="invoice-header mb-4">
        <div className="row align-items-center">
          <div className="col-6">
            <img
              src="https://img.icons8.com/?size=80&id=66760&format=png&color=D57907"
              alt="Company Logo"
              className="invoice-logo mb-2"
            />
          </div>
          <div className="col-6 text-end">
            <h2 className="text-dark fw-bold mb-1">INVOICE</h2>
            <p className="mb-1">Order ID: #{order.oid}</p>
            <p className="mb-1">Order Date: {moment(order.date).format("MMMM DD, YYYY")}</p>
            <div className="status-badges">
              <span
                className={`badge bg-${
                  order.payment_status === "paid" ? "success" : "danger"
                } me-2`}
              >
                Payment Status: {order.payment_status?.toUpperCase()}
              </span>
              <span
                className={`badge bg-${
                  order.order_status === "delivered" ? "primary" : "warning"
                }`}
              >
                Order Status: {order.order_status?.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Address Section */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="billing-details p-3 border card">
            <h5 className="fw-bold">Bill To:</h5>
            <div className="mt-2">
              <p className="fw-bold mb-1">{order.full_name}</p>
              <p className="mb-1">{order.email}</p>
              <p className="mb-1">{order.mobile}</p>
              <p className="mb-1">{order.address}</p>
              <p className="mb-1">
                {order.city}, {order.state}
              </p>
              <p className="mb-0">{order.country}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      {Object.values(vendorGroups).map((group) => (
        <div key={group.vendor.id} className="vendor-section mb-4">
          <div className="vendor-header p-3 bg-light rounded mb-3">
            <div className="d-flex align-items-center">
              <img
                src={group.vendor.image || "/api/placeholder/40/40"}
                alt={group.vendor.name}
                className="rounded-circle me-3"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
              />
              <div>
                <h5 className="mb-0 fw-bold">{group.vendor.name}</h5>
                <small className="text-muted">{group.vendor.mobile}</small>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-bordered">
              <thead>
                <tr className="bg-light">
                  <th scope="col" style={{ width: "40%" }}>
                    Product
                  </th>
                  <th scope="col" style={{ width: "20%" }}>
                    Specifications
                  </th>
                  <th scope="col" className="text-end">
                    Price
                  </th>
                  <th scope="col" className="text-end">
                    Qty
                  </th>
                  <th scope="col" className="text-end">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="d-flex align-items-center">
                        <img
                          src={item.product.image || "/api/placeholder/50/50"}
                          alt={item.product.title}
                          className="me-2 rounded"
                          style={{
                            width: "50px",
                            height: "50px",
                            objectFit: "cover",
                          }}
                        />
                        <div>
                          <p className="mb-0 fw-semibold">
                            {item.product.title}
                          </p>
                          {item.coupon.length > 0 && (
                            <small className="text-success">
                              Coupon: {item.coupon[0].code} (
                              {item.coupon[0].discount}% OFF)
                            </small>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <small>
                        <div>Size: {item.size}</div>
                        <div>Color: {item.color}</div>
                      </small>
                    </td>
                    <td className="text-end">
                      ${parseFloat(item.price).toFixed(2)}
                    </td>
                    <td className="text-end">{item.qty}</td>
                    <td className="text-end">
                      ${parseFloat(item.sub_total).toFixed(2)}
                      {parseFloat(item.saved) > 0 && (
                        <div className="text-success small">
                          Saved: ${calculateSavings(item)}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Summary Section */}
      <div className="row mt-4">
        <div className="col-md-5 ms-auto">
          <table className="table table-bordered">
            <tbody>
              <tr>
                <td className="text-end fw-semibold">Subtotal:</td>
                <td className="text-end">
                  ${parseFloat(order.sub_total).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="text-end fw-semibold">Shipping:</td>
                <td className="text-end">
                  ${parseFloat(order.shipping_amount).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="text-end fw-semibold">Service Fee:</td>
                <td className="text-end">
                  ${parseFloat(order.service_fee).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="text-end fw-semibold">Tax:</td>
                <td className="text-end">
                  ${parseFloat(order.tax_fee).toFixed(2)}
                </td>
              </tr>
              {order.saved > 0 && (
                <tr className="text-success">
                  <td className="text-end fw-semibold">Total Savings:</td>
                  <td className="text-end">
                    -${parseFloat(order.saved).toFixed(2)}
                  </td>
                </tr>
              )}
              <tr className="table-active">
                <td className="text-end fw-bold">Total:</td>
                <td className="text-end fw-bold">
                  ${parseFloat(order.total).toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Section */}
      <div className="mt-4 pt-4 border-top text-center">
        <p className="mb-1">Thank you for your business!</p>
        <small className="text-muted">
          For any questions, please contact support at support@kosimart.com
        </small>
      </div>
    </div>
  );

  return (
    <>
      {/* Screen View */}
      <div className="mt-3 border card container-fluid p-4 invoice-container screen-only">
        <div className="text-end mb-4">
          <button className="btn btn-warning" onClick={handlePrint}>
            <i className="fas fa-print me-2"></i>Print Invoice
          </button>
        </div>
        <InvoiceContent />
      </div>

      {/* Hidden Print View */}
      <div id="print-invoice" className="print-only">
        <InvoiceContent />
      </div>

      <style>
        {`
          /* Screen styles */
          @media screen {
            .print-only {
              display: none;
            }
            .invoice-container {
              max-width: 1140px;
              margin: 0 auto;
            }
          }

          /* Print styles */
          @media print {
            /* Hide everything by default */
            body * {
              visibility: hidden;
            }
            
            /* Hide header and footer */
            header, 
            footer,
            nav,
            .store-header,
            .store-footer {
              display: none !important;
            }

            /* Show only invoice content */
            #print-invoice,
            #print-invoice * {
              visibility: visible;
            }

            /* Position the invoice */
            #print-invoice {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }

            /* Hide screen elements */
            .screen-only {
              display: none !important;
            }

            /* Page setup */
            @page {
              size: A4;
              margin: 1.5cm;
            }

            /* Ensure background colors print */
            .bg-light {
              background-color: #f8f9fa !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Keep text colors in print */
            .text-success {
              color: #28a745 !important;
            }

            .badge {
              border: 1px solid #dee2e6 !important;
            }

            /* Maintain layout structure */
            .row {
              display: flex !important;
            }

            .col-md-6 {
              flex: 0 0 50% !important;
              max-width: 50% !important;
            }
          }
        `}
      </style>
    </>
  );
}

export default Invoice;
