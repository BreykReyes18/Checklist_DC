import Swal from "sweetalert2"

export const swalNoc = Swal.mixin({
  customClass: { popup: "swal-noc" },
  background: "#121821",
  color: "#E7EBF0",
  confirmButtonColor: "#33C7D6",
  cancelButtonColor: "#26303C"
})

export default swalNoc
