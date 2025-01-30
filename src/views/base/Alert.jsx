import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  iconColor: "rgb(49, 45, 40)",
  color: "rgb(49, 45, 40)",
  // background: "rgb(213, 121, 8)",
  background: "rgb(255, 255, 255)",
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

const AlertFailed = Swal.mixin({
  position: "center",
  showConfirmButton: true,
  confirmButtonText: "Close",
  confirmButtonColor: "rgb(49, 45, 40)",
  iconColor: "rgb(49, 45, 40)",
  color: "rgb(49, 45, 40)",
  // background: "rgb(213, 121, 8)",
  background: "rgb(255, 255, 255)",
});

export { Toast, AlertFailed };
