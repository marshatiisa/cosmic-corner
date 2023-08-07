function confirmEmptyCart() {
  const confirmResult = confirm("Are you sure you want to completely empty your cart?");
  if (confirmResult) {
    document.querySelector("form[action='/post/emptyCart']").submit();
  } else {
    event.preventDefault();
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const hoverButton = document.getElementById("stripeButton");
  const hiddenDiv = document.getElementById("paymentTestInfo");

  if (hoverButton && hiddenDiv) {
    hoverButton.addEventListener("mouseenter", () => {
      hiddenDiv.style.display = "inline-block";
    });

    hoverButton.addEventListener("mouseleave", () => {
      hiddenDiv.style.display = "none";
    });
  }
});
