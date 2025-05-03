function StoreFooter() {
  return (
    <div>
      <br></br>
      <br></br>
      <br></br>
      <footer className="bg-dark text-center text-lg-start">
        {/* Grid container */}
        <div className="container-fluid p-4">
          <div className="row">
            <div className="col-md-6 mb-4 mb-md-0 d-flex justify-content-center justify-content-md-start align-items-center">
              <strong className="text-secondary">
                Get connected with us on social networks
              </strong>
            </div>
            <div className="col-md-6 d-flex justify-content-center justify-content-md-end">
              {/* Facebook */}
              <a
                className="btn btn-primary btn-sm btn-floating me-2"
                style={{ backgroundColor: "#3b5998" }}
                href="#!"
                role="button"
              >
                <i className="fab fa-facebook-f" />
              </a>
              {/* Twitter */}
              <a
                className="btn text-white btn-sm btn-floating me-2"
                style={{ backgroundColor: "#55acee" }}
                href="#!"
                role="button"
              >
                <i className="fab fa-twitter" />
              </a>
              {/* Pinterest */}
              <a
                className="btn text-white btn-sm btn-floating me-2"
                style={{ backgroundColor: "#c61118" }}
                href="#!"
                role="button"
              >
                <i className="fab fa-pinterest" />
              </a>
              {/* Youtube */}
              <a
                className="btn text-white btn-sm btn-floating me-2"
                style={{ backgroundColor: "#ed302f" }}
                href="#!"
                role="button"
              >
                <i className="fab fa-youtube" />
              </a>
              {/* Instagram */}
              <a
                className="btn text-white btn-sm btn-floating me-2"
                style={{ backgroundColor: "#ac2bac" }}
                href="#!"
                role="button"
              >
                <i className="fab fa-instagram" />
              </a>
            </div>
          </div>
          <hr className="my-3" />
          {/*Grid row*/}
          <div className="row">
            {/*Grid column*/}
            <div className="col-lg-4 mb-4 mb-lg-0 text-secondary">
              <p>
                <strong>About us</strong>
              </p>
              <p>
                Kosimart offer the best services to help you achieve your goals.
                Discover a world of endless possibilities where you can shop
                from a diverse range of vendors, find unique products, and enjoy
                a seamless shopping experience.
              </p>
            </div>
            {/*Grid column*/}
            {/*Grid column*/}
            <div className="col-lg-3 mb-4 mb-lg-0">
              <p>
                <strong>Useful links</strong>
              </p>
              <ul className="list-unstyled mb-0">
                <li>
                  <a href="#!" className="text-secondary">
                    Privacy policy
                  </a>
                </li>
                <li>
                  <a href="#!" className="text-secondary">
                    Media
                  </a>
                </li>
                <li>
                  <a href="#!" className="text-secondary">
                    Job offers
                  </a>
                </li>
                <li>
                  <a href="#!" className="text-secondary">
                    Cooperation
                  </a>
                </li>
              </ul>
            </div>
            {/*Grid column*/}
            {/*Grid column*/}
            <div className="col-lg-3 mb-4 mb-lg-0">
              <p>
                <strong>Products</strong>
              </p>
              <ul className="list-unstyled">
                <li>
                  <a href="#!" className="text-secondary">
                    Electronics
                  </a>
                </li>
                <li>
                  <a href="#!" className="text-secondary">
                    Fashion
                  </a>
                </li>
                <li>
                  <a href="#!" className="text-secondary">
                    Beauty
                  </a>
                </li>
                <li>
                  <a href="#!" className="text-secondary">
                    Automotive
                  </a>
                </li>
              </ul>
            </div>
            {/*Grid column*/}
            {/*Grid column*/}
            <div className="col-lg-2 mb-4 mb-lg-0">
              <p>
                <strong>Support</strong>
              </p>
              <ul className="list-unstyled">
                <li>
                  <a href="#!" className="text-secondary">
                    Complaints
                  </a>
                </li>
                <li>
                  <a href="#!" className="text-secondary">
                    Help center
                  </a>
                </li>
                <li>
                  <a href="#!" className="text-secondary">
                    Community
                  </a>
                </li>
                <li>
                  <a href="#!" className="text-secondary">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            {/*Grid column*/}
          </div>
          {/*Grid row*/}
        </div>
        {/* Grid container */}
        {/* Copyright */}
        <div
          className="text-center p-3 text-secondary"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
        >
          © 2025 Copyright: Kosimart
        </div>
        {/* Copyright */}
      </footer>
    </div>
  );
}

export default StoreFooter;
