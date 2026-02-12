import { json } from '@tanstack/react-start'

export async function GET({ request }: { request: Request }) {
  const url = new URL(request.url)
  const products = url.searchParams.get('products')
  const customerEmail = url.searchParams.get('customerEmail')
  const customerName = url.searchParams.get('customerName')
  
  if (!products) {
    return json(
      { error: 'Products parameter is required' },
      { status: 400 }
    )
  }

  // For now, return a simple redirect to Polar checkout
  // In production, you'd use the Polar SDK to create a proper checkout session
  const polarCheckoutUrl = `https://api.polar.sh/v1/checkouts?products=${products}&customer_email=${customerEmail}&customer_name=${customerName}&success_url=${encodeURIComponent(process.env.PUBLIC_URL + '/team/settings?billing=success')}&return_url=${encodeURIComponent(process.env.PUBLIC_URL + '/team/settings')}`

  return Response.redirect(polarCheckoutUrl, 302)
}