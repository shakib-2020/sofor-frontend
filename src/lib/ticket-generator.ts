import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface TicketData {
  bookingNumber: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  tripHeading: string;
  departureDate: string;
  departureTime: string;
  arrivalDate: string;
  arrivalTime: string;
  busName: string;
  seatNumber: string;
  boardingPoint: string;
  droppingPoint: string;
  totalAmount: string;
  paymentMethod: string;
  transactionId?: string;
  status: string;
}

export const generateTicketPDF = async (ticketData: TicketData): Promise<void> => {
  try {
    // Create a temporary div for the ticket
    const ticketElement = createTicketElement(ticketData);
    document.body.appendChild(ticketElement);

    // Convert to canvas
    const canvas = await html2canvas(ticketElement, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      height: ticketElement.offsetHeight,
      width: ticketElement.offsetWidth,
    });

    // Remove the temporary element
    document.body.removeChild(ticketElement);

    // Create PDF
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 190;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
    pdf.save(`bus-ticket-${ticketData.bookingNumber}.pdf`);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF ticket');
  }
};

export const printTicket = async (ticketData: TicketData): Promise<void> => {
  try {
    // Create a temporary div for the ticket
    const ticketElement = createTicketElement(ticketData);
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Could not open print window');
    }

    // Add CSS for print styling
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sofor Ticket - ${ticketData.bookingNumber}</title>
        <style>
          body { margin: 0; font-family: Arial, sans-serif; }
          .ticket { margin: 20px; }
          @media print {
            body { margin: 0; }
            .ticket { margin: 0; }
          }
        </style>
      </head>
      <body>
        ${ticketElement.outerHTML}
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load, then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => {
        printWindow.close();
      };
    };

  } catch (error) {
    console.error('Error printing ticket:', error);
    throw new Error('Failed to print ticket');
  }
};

const createTicketElement = (ticketData: TicketData): HTMLElement => {
  const ticketDiv = document.createElement('div');
  ticketDiv.className = 'ticket';
  ticketDiv.style.cssText = `
    width: 600px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    padding: 24px;
    font-family: Arial, sans-serif;
    color: #333;
  `;

  ticketDiv.innerHTML = `
    <div style="text-align: center; margin-bottom: 24px; border-bottom: 2px dashed #d1d5db; padding-bottom: 16px;">
      <h1 style="margin: 0; color: #16a34a; font-size: 24px; font-weight: bold;">🚌 Sofor Ticket</h1>
      <p style="margin: 8px 0 0 0; font-size: 14px; color: #6b7280;">Your journey awaits!</p>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <div style="flex: 1;">
        <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #1f2937;">Booking Details</h2>
        <div style="font-size: 14px; line-height: 1.6;">
          <p style="margin: 4px 0;"><strong>Booking No:</strong> ${ticketData.bookingNumber}</p>
          <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: #16a34a;">${ticketData.status}</span></p>
          <p style="margin: 4px 0;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
      <div style="flex: 1; text-align: right;">
        <h2 style="margin: 0 0 12px 0; font-size: 18px; color: #1f2937;">Passenger</h2>
        <div style="font-size: 14px; line-height: 1.6;">
          <p style="margin: 4px 0;"><strong>${ticketData.passengerName}</strong></p>
          <p style="margin: 4px 0;">${ticketData.passengerPhone}</p>
          <p style="margin: 4px 0;">${ticketData.passengerEmail}</p>
        </div>
      </div>
    </div>

    <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1f2937; text-align: center;">Journey Information</h2>
      
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div style="text-align: center; flex: 1;">
          <div style="font-size: 16px; font-weight: bold; color: #1f2937;">${ticketData.departureTime}</div>
          <div style="font-size: 12px; color: #6b7280;">${ticketData.departureDate}</div>
          <div style="font-size: 14px; margin-top: 4px;">${ticketData.boardingPoint}</div>
        </div>
        
        <div style="text-align: center; margin: 0 20px;">
          <div style="border-top: 2px solid #16a34a; width: 60px; position: relative;">
            <div style="position: absolute; top: -6px; left: -6px; width: 12px; height: 12px; border-radius: 50%; background: #16a34a;"></div>
            <div style="position: absolute; top: -6px; right: -6px; width: 12px; height: 12px; border-radius: 50%; background: #16a34a;"></div>
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-top: 8px;">🚌 ${ticketData.busName}</div>
        </div>
        
        <div style="text-align: center; flex: 1;">
          <div style="font-size: 16px; font-weight: bold; color: #1f2937;">${ticketData.arrivalTime}</div>
          <div style="font-size: 12px; color: #6b7280;">${ticketData.arrivalDate}</div>
          <div style="font-size: 14px; margin-top: 4px;">${ticketData.droppingPoint}</div>
        </div>
      </div>
      
      <div style="text-align: center; font-size: 16px; color: #1f2937; margin-top: 12px;">
        <strong>${ticketData.tripHeading}</strong>
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <div style="flex: 1;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937;">Seat Details</h3>
        <div style="font-size: 14px;">
          <p style="margin: 4px 0;"><strong>Seat Number:</strong> ${ticketData.seatNumber}</p>
        </div>
      </div>
      <div style="flex: 1; text-align: right;">
        <h3 style="margin: 0 0 8px 0; font-size: 16px; color: #1f2937;">Payment</h3>
        <div style="font-size: 14px;">
          <p style="margin: 4px 0;"><strong>Amount:</strong> <span style="color: #16a34a; font-size: 18px;">৳${ticketData.totalAmount}</span></p>
          <p style="margin: 4px 0;"><strong>Method:</strong> ${ticketData.paymentMethod}</p>
          ${ticketData.transactionId ? `<p style="margin: 4px 0; font-size: 12px;"><strong>Txn ID:</strong> ${ticketData.transactionId}</p>` : ''}
        </div>
      </div>
    </div>

    <div style="border-top: 2px dashed #d1d5db; padding-top: 16px; text-align: center;">
      <div style="font-size: 12px; color: #6b7280; line-height: 1.4;">
        <p style="margin: 4px 0;">📱 Keep this ticket handy during your journey</p>
        <p style="margin: 4px 0;">🎫 Show this ticket to the conductor when boarding</p>
        <p style="margin: 4px 0;">📞 For support, contact us at your booking platform</p>
        <p style="margin: 8px 0 0 0; font-style: italic;">Thank you for choosing our bus service! 🚌</p>
      </div>
    </div>
  `;

  return ticketDiv;
};
