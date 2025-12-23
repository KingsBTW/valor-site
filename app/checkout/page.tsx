import { redirect } from "next/navigation"

// Redirect /checkout to products page since checkout happens on product pages
export default function CheckoutPage() {
  redirect("/products")
}
