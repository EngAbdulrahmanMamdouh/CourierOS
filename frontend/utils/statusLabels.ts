export const SHIPMENT_STATUS_KEY = (status: string) => {
  // Map raw status values (unchanged) to i18n keys
  switch (status) {
    case 'Pending':
      return 'status.shipments.pending'
    case 'In Transit':
      return 'status.shipments.in_transit'
    case 'Delivered':
      return 'status.shipments.delivered'
    case 'Cancelled':
      return 'status.shipments.cancelled'
    case 'Returned':
      return 'status.shipments.returned'
    default:
      return null
  }
}

export const PAYMENT_STATUS_KEY = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'payments.option.status.completed'
    case 'Pending':
      return 'payments.option.status.pending'
    case 'Failed':
      return 'payments.option.status.failed'
    default:
      return null
  }
}

export default null
