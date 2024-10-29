


//import modules
const  moment      =   require("moment");
const PDFDocument  =   require('pdfkit');
const ExcelJS      =   require('exceljs');




//import schemas
const  Order       =   require("../../models/orderSchema") ;




//GET  SALES  REPORT  PAGE
const   salesReport   =  async  ( req ,res )  =>{
    try{
        if(!req.session.adminId){
            return res.redirect("/admin");
        }
    
      const { dateRange, fromDate, toDate } = req.query;
    
      let startDate = new Date();
      let endDate = new Date();
    
      switch (dateRange) {
        case 'day':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'custom':
          startDate = new Date(fromDate);
          endDate = new Date(toDate);
          endDate.setHours(23, 59, 59, 999);
          break;
        default:
          break;
      }
    
      const salesReport = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate },
      }).populate("userId");
    
   
      // Calculate summary data
      const totalSalesCount = salesReport.length;
      const totalOrderAmount = salesReport.reduce((sum, order) => sum + order.totalPrice, 0);
      const totalDiscount = salesReport.reduce((sum, order) => sum + order.totalDiscount , 0);
      const totalCouponDeduction = salesReport.reduce((sum, order) => sum + order.appliedCoupon, 0);
    


     //pagination
      const page = parseInt(req.query.page) || 1 ; 
      const limit = 10 ;
     
      const totalOrders = await Order.countDocuments({ createdAt: { $gte: startDate, $lte: 
        endDate }}) ;
      const skip = ( page-1 ) * limit ; 
     
      const orders = await Order.find({
        createdAt: { $gte: startDate, $lte: endDate }, 
      }).skip(skip).limit(limit).populate("userId") ; 


      const totalPages = Math.ceil( totalOrders/limit ) ;  




      res.render("backend/admin-dashboard" , {
        partial : "partials/sales-report" ,
        salesReport,
        totalSalesCount,
        totalOrderAmount,
        totalDiscount,
        totalCouponDeduction , 
        admin : req.session.adminEmail ,

        orders ,  currentPage : page  , totalPages , 
        searchKeyword : "" 
      });
    }catch(err){
        console.log(err) ;
        res.status(500).render("frontend/404") ;  
    }
}




// //DOWNLOAD PDF
const generatePDF = async (req, res) => {
    try {
        const { dateRange, fromDate, toDate } = req.query;
    
        let startDate = new Date();
        let endDate = new Date();
        
        // Process date range logic
        switch (dateRange) {
            case 'day':
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'custom':
                startDate = new Date(fromDate);
                endDate = new Date(toDate);
                endDate.setHours(23, 59, 59, 999);
                break;
            default:
                break;
        }
    
        // Fetch sales data with populated references
        const salesReport = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate([
            { path: 'userId', select: 'firstName lastName email' },
            { path: 'shippingAddress' },
            { path: 'items.product', select: 'title category price' }
        ]);
    
        // Calculate summary statistics
        const summary = {
            totalOrders: salesReport.length,
            totalRevenue: salesReport.reduce((sum, order) => sum + order.totalPrice, 0),
            totalDiscount: salesReport.reduce((sum, order) => sum + (order.totalDiscount || 0), 0),
            totalCoupons: salesReport.reduce((sum, order) => sum + (order.appliedCoupon || 0), 0),
            totalWallet: salesReport.reduce((sum, order) => sum + (order.appliedWallet || 0), 0),
        };
    
        // Create PDF document with better margins
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4'
        });
    
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=sales_report_${moment().format('YYYY-MM-DD')}.pdf`);
        doc.pipe(res);

        // Define layout constants
        const pageWidth = doc.page.width;
        const margins = {
            left: 50,
            right: pageWidth - 50,
            top: 50,
            bottom: 50
        };

        // Draw page border
        const drawPageBorder = () => {
            doc.rect(margins.left - 10, margins.top - 10, 
                    pageWidth - (margins.left - 10) * 2, 
                    doc.page.height - (margins.top - 10) * 2)
               .stroke();
        };
        
        drawPageBorder();

        // Header with company logo or name
        doc.fontSize(24)
           .font('Helvetica-Bold')
           .text('Sales Report', margins.left, margins.top, { align: 'center' })
           .moveDown(0.5);

        // Date Range
        doc.fontSize(12)
           .font('Helvetica')
           .text(`Period: ${moment(startDate).format('MMMM D, YYYY')} - ${moment(endDate).format('MMMM D, YYYY')}`, {
               align: 'center'
           })
           .moveDown(2);

        // Summary Section
        doc.font('Helvetica-Bold')
           .fontSize(16)
           .text('Summary', margins.left)
           .moveDown();

        // Draw summary box
        const summaryBoxY = doc.y;
        doc.rect(margins.left, summaryBoxY, 
                margins.right - margins.left, 100).stroke();

        // Summary content
        doc.fontSize(12)
           .font('Helvetica')
           .text(`Total Orders: ${summary.totalOrders}`, margins.left + 10, summaryBoxY + 10)
           .text(`Total Revenue: ₹${summary.totalRevenue.toFixed(2)}`, margins.left + 10)
           .text(`Total Discounts: ₹${summary.totalDiscount.toFixed(2)}`, margins.left + 10)
           .text(`Total Coupon Deductions: ₹${summary.totalCoupons.toFixed(2)}`, margins.left + 10)
           .text(`Total Wallet Usage: ₹${summary.totalWallet.toFixed(2)}`, margins.left + 10)
           .moveDown(2);

        // Orders Table
        const drawOrdersTable = () => {
            const tableTop = doc.y;
            const tableHeaders = ['Order ID', 'Customer', 'Date', 'Status', 'Amount'];
            const columnWidth = (margins.right - margins.left) / tableHeaders.length;

            // Draw table header
            doc.font('Helvetica-Bold')
               .fontSize(12);

            tableHeaders.forEach((header, i) => {
                doc.text(header, 
                        margins.left + (columnWidth * i), 
                        tableTop,
                        { width: columnWidth, align: 'center' });
            });

            // Draw header line
            doc.moveTo(margins.left, tableTop + 20)
               .lineTo(margins.right, tableTop + 20)
               .stroke();

            return tableTop + 30;
        };

        let tableY = drawOrdersTable();

        // Order details
        doc.font('Helvetica')
           .fontSize(10);

        for (const order of salesReport) {
            // Check if we need a new page
            if (tableY > margins.bottom + 500) {
                doc.addPage();
                drawPageBorder();
                tableY = drawOrdersTable();
            }

            // Validate and safely access order data
            const orderId = order._id?.toString().substring(0, 8) || 'N/A';
            const customerName = order.userId ? 
                `${order.userId.firstName || ''} ${order.userId.lastName || ''}`.trim() : 'N/A';
            const orderDate = moment(order.createdAt).format('MM/DD/YY');
            const status = order.orderStatus || 'N/A';
            const amount = order.totalPrice ? `₹${order.totalPrice.toFixed(2)}` : 'N/A';

            const columnWidth = (margins.right - margins.left) / 5;

            // Draw order row
            doc.text(orderId, margins.left, tableY, 
                    { width: columnWidth, align: 'center' })
               .text(customerName, margins.left + columnWidth, tableY, 
                    { width: columnWidth, align: 'center' })
               .text(orderDate, margins.left + (columnWidth * 2), tableY, 
                    { width: columnWidth, align: 'center' })
               .text(status, margins.left + (columnWidth * 3), tableY, 
                    { width: columnWidth, align: 'center' })
               .text(amount, margins.left + (columnWidth * 4), tableY, 
                    { width: columnWidth, align: 'center' });

            // Draw line between orders
            doc.moveTo(margins.left, tableY + 15)
               .lineTo(margins.right, tableY + 15)
               .stroke();

            tableY += 20;

            // Add order items
            if (order.items && order.items.length > 0) {
                doc.fontSize(9);
                for (const item of order.items) {
                    if (item.product) {  // Check if product exists
                        const itemDetails = `• ${item.product.title || 'Unknown Product'} - Qty: ${item.quantity}, Size: ${item.size}, Price: ₹${item.price || 0}`;
                        doc.text(itemDetails, margins.left + 20, tableY, 
                               { width: margins.right - margins.left - 40 });
                        tableY += 15;
                    }
                }
                tableY += 10;
            }
        }

        // Footer
        doc.fontSize(8)
           .text(`Report generated on ${moment().format('MMMM D, YYYY, h:mm A')}`,
                 margins.left,
                 doc.page.height - 30,
                 { align: 'center' });

        doc.end();

    } catch (err) {
        console.error('Error generating PDF:', err);
        res.status(500).render("frontend/404");
    }
};







//DOWNLOAD EXCEL 
// const  generateExcel  = async  ( req , res ) =>  {
//     try{
//         const { dateRange , fromDate , toDate } = req.query ;
  
//         let startDate = new Date();
//         let endDate = new Date();
    
//         // Process date range logic
//         switch (dateRange) {
//             case 'day':
//                 startDate.setHours(0, 0, 0, 0);
//                 endDate.setHours(23, 59, 59, 999);
//                 break;
//             case 'week':
//                 startDate.setDate(startDate.getDate() - 7);
//                 endDate.setHours(23, 59, 59, 999);
//                 break;
//             case 'month':
//                 startDate.setMonth(startDate.getMonth() - 1);
//                 endDate.setHours(23, 59, 59, 999);
//                 break;
//             case 'year':
//                 startDate.setFullYear(startDate.getFullYear() - 1);
//                 endDate.setHours(23, 59, 59, 999);
//                 break;
//             case 'custom':
//                 startDate = new Date(fromDate);
//                 endDate = new Date(toDate);
//                 endDate.setHours(23, 59, 59, 999);
//                 break;
//             default:
//                 break;
//         }
  
//         // Fetch sales data
//         const salesReport = await Order.find({
//             createdAt: { $gte: startDate, $lte: endDate }
//         }).populate([
//             { path: 'userId', select: 'firstName lastName email' },
//             { path: 'shippingAddress' },
//             { path: 'items.product', select: 'name category' }
//         ]);
  
//         // Calculate summary
//         const summary = {
//             totalOrders: salesReport.length,
//             totalRevenue: salesReport.reduce((sum, order) => sum + order.totalPrice, 0),
//             totalDiscount: salesReport.reduce((sum, order) => sum + (order.totalDiscount || 0), 0),
//             totalCoupons: salesReport.reduce((sum, order) => sum + (order.appliedCoupon || 0), 0),
//             totalWallet: salesReport.reduce((sum, order) => sum + (order.appliedWallet || 0), 0),
//         };
  
//         // Create new workbook and worksheet
//         const workbook = new ExcelJS.Workbook();
//         const worksheet = workbook.addWorksheet('Sales Report');
  
//         // Add title
//         worksheet.mergeCells('A1:G1');
//         worksheet.getCell('A1').value = 'Sales Report';
//         worksheet.getCell('A1').font = {
//             bold: true,
//             size: 16
//         };
//         worksheet.getCell('A1').alignment = { horizontal: 'center' };
  
//         // Add date range
//         worksheet.mergeCells('A2:G2');
//         worksheet.getCell('A2').value = `Period: ${moment(startDate).format('MMMM D, YYYY')} - ${moment(endDate).format('MMMM D, YYYY')}`;
//         worksheet.getCell('A2').alignment = { horizontal: 'center' };
  
//         // Add summary section
//         worksheet.getCell('A4').value = 'Summary';
//         worksheet.getCell('A4').font = { bold: true };
  
//         const summaryData = [
//             ['Total Orders', summary.totalOrders],
//             ['Total Revenue', summary.totalRevenue, 'currency'],
//             ['Total Discounts', summary.totalDiscount, 'currency'],
//             ['Total Coupon Deductions', summary.totalCoupons, 'currency'],
//             ['Total Wallet Usage', summary.totalWallet, 'currency']
//         ];
  
//         summaryData.forEach((row, index) => {
//             worksheet.getCell(`A${5 + index}`).value = row[0];  
//             const cell = worksheet.getCell(`B${5 + index}`);
//             cell.value = row[1];
//             if (row[2] === 'currency') {
//                 cell.numFmt = '₹#,##0.00';
//             }
//         });
  
//         // Add detailed orders section
//         worksheet.getCell('A11').value = 'Detailed Orders';
//         worksheet.getCell('A11').font = { bold: true };
  
//         // Add headers for detailed orders
//         const headers = ['Order ID', 'Customer', 'Date', 'Status', 'Amount', 'Items'];
//         const headerRow = worksheet.getRow(13);
//         headers.forEach((header, index) => {
//             const cell = headerRow.getCell(index + 1);
//             cell.value = header;
//             cell.font = { bold: true };
//         });
  
//         // Style the header row
//         worksheet.getRow(13).height = 20;
//         worksheet.getRow(13).alignment = { vertical: 'middle' };
  
//         // Add order data
//         let currentRow = 14;
//         salesReport.forEach(order => {
//             const row = worksheet.getRow(currentRow);
            
//             // Main order information
//             row.getCell(1).value = order._id.toString();
//             row.getCell(2).value = `${order.userId?.firstName || 'N/A'} ${order.userId?.lastName || ''}`;
//             row.getCell(3).value = moment(order.createdAt).format('DD/MM/YYYY');
//             row.getCell(4).value = order.orderStatus;
            
//             const amountCell = row.getCell(5);
//             amountCell.value = order.totalPrice;
//             amountCell.numFmt = '₹#,##0.00';
  
//             // Items information
//             const itemsInfo = order.items.map(item => 
//                 `${item.product.name} (Qty: ${item.quantity}, Size: ${item.size}, Price: ₹${item.price})`
//             ).join('\n');
//             row.getCell(6).value = itemsInfo;
            
//             // Adjust row height based on content
//             row.height = 25 * Math.max(1, order.items.length);
            
//             // Style alignment
//             row.alignment = { vertical: 'middle', wrapText: true };
            
//             currentRow++;
//         });
  
//         // Adjust column widths
//         worksheet.columns.forEach((column, index) => {
//             let maxLength = 0;
//             column.eachCell({ includeEmpty: false }, cell => {
//                 const columnLength = cell.value ? cell.value.toString().length : 10;
//                 if (columnLength > maxLength) {
//                     maxLength = columnLength;
//                 }
//             });
//             column.width = Math.min(maxLength + 2, 50);
//         });
  
//         // Set response headers
//         res.setHeader(
//             'Content-Type',
//             'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
//         );
//         res.setHeader(
//             'Content-Disposition',
//             `attachment; filename=sales_report_${moment().format('YYYY-MM-DD')}.xlsx`
//         );
  
//         // Write to response
//         await workbook.xlsx.write(res);
//     }catch(err){
//         console.log(err) ;
//         res.status(500).render("frontend/404") ;           
//     }
// }





const generateExcel = async (req, res) => {
    try {
        const { dateRange, fromDate, toDate } = req.query;
        
        // Set date range
        let startDate = new Date();
        let endDate = new Date();

        switch (dateRange) {
            case 'day':
                startDate.setHours(0, 0, 0, 0);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'week':
                startDate.setDate(startDate.getDate() - 7);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'month':
                startDate.setMonth(startDate.getMonth() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'year':
                startDate.setFullYear(startDate.getFullYear() - 1);
                endDate.setHours(23, 59, 59, 999);
                break;
            case 'custom':
                startDate = new Date(fromDate);
                endDate = new Date(toDate);
                endDate.setHours(23, 59, 59, 999);
                break;
            default:
                break;
        }

        // Fetch sales data
        const salesReport = await Order.find({
            createdAt: { $gte: startDate, $lte: endDate }
        }).populate([
            { path: 'userId', select: 'firstName lastName email' },
            { path: 'shippingAddress' },
            { path: 'items.product', select: 'title' }
        ]);

        // Calculate summary
        const summary = {
            totalOrders: salesReport.length,
            totalRevenue: salesReport.reduce((sum, order) => sum + order.totalPrice, 0),
            totalDiscount: salesReport.reduce((sum, order) => sum + (order.totalDiscount || 0), 0),
            totalCoupons: salesReport.reduce((sum, order) => sum + (order.appliedCoupon || 0), 0),
            totalWallet: salesReport.reduce((sum, order) => sum + (order.appliedWallet || 0), 0),
        };

        // Create new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        // Add title
        worksheet.mergeCells('A1:G1');
        worksheet.getCell('A1').value = 'Sales Report';
        worksheet.getCell('A1').font = { bold: true, size: 16 };
        worksheet.getCell('A1').alignment = { horizontal: 'center' };

        // Add date range
        worksheet.mergeCells('A2:G2');
        worksheet.getCell('A2').value = `Period: ${moment(startDate).format('MMMM D, YYYY')} - ${moment(endDate).format('MMMM D, YYYY')}`;
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        // Add summary section
        worksheet.getCell('A4').value = 'Summary';
        worksheet.getCell('A4').font = { bold: true };

        const summaryData = [
            ['Total Orders', summary.totalOrders],
            ['Total Revenue', summary.totalRevenue, 'currency'],
            ['Total Discounts', summary.totalDiscount, 'currency'],
            ['Total Coupon Deductions', summary.totalCoupons, 'currency'],
            ['Total Wallet Usage', summary.totalWallet, 'currency']
        ];

        summaryData.forEach((row, index) => {
            worksheet.getCell(`A${5 + index}`).value = row[0];
            const cell = worksheet.getCell(`B${5 + index}`);
            cell.value = row[1];
            if (row[2] === 'currency') {
                cell.numFmt = '₹#,##0.00';
            }
        });

        // Add detailed orders section
        worksheet.getCell('A11').value = 'Detailed Orders';
        worksheet.getCell('A11').font = { bold: true };

        // Add headers for detailed orders
        const headers = ['Order ID', 'Customer', 'Date', 'Status', 'Amount', 'Items'];
        const headerRow = worksheet.getRow(13);
        headers.forEach((header, index) => {
            const cell = headerRow.getCell(index + 1);
            cell.value = header;
            cell.font = { bold: true };
        });

        // Style the header row
        worksheet.getRow(13).height = 20;
        worksheet.getRow(13).alignment = { vertical: 'middle' };

        // Add order data
        let currentRow = 14;
        salesReport.forEach(order => {
            const row = worksheet.getRow(currentRow);

            // Main order information
            row.getCell(1).value = order._id.toString();
            row.getCell(2).value = `${order.userId?.firstName || 'N/A'} ${order.userId?.lastName || ''}` ; 
            row.getCell(3).value = moment(order.createdAt).format('DD/MM/YYYY'); 
            row.getCell(4).value = order.orderStatus;

            const amountCell = row.getCell(5);
            amountCell.value = order.totalPrice;
            amountCell.numFmt = '₹#,##0.00';

        

            const itemsInfo = order.items.map(item => 
                `${item.product?.title || 'Unknown Product'} (Qty: ${item.quantity}, Size: ${item.size}, Price: ₹${item.price})`
              ).join('\n');
              row.getCell(6).value = itemsInfo;

            // Adjust row height based on content
            row.height = 25 * Math.max(1, order.items.length);

            // Style alignment
            row.alignment = { vertical: 'middle', wrapText: true };

            currentRow++;
        });

        // Adjust column widths
        worksheet.columns.forEach((column, index) => {
            let maxLength = 0;
            column.eachCell({ includeEmpty: false }, cell => {
                const columnLength = cell.value ? cell.value.toString().length : 10;
                if (columnLength > maxLength) {
                    maxLength = columnLength;
                }
            });
            column.width = Math.min(maxLength + 2, 50);
        });

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=sales_report_${moment().format('YYYY-MM-DD')}.xlsx`
        );

        // Write to response
        await workbook.xlsx.write(res);
    } catch (err) {
        console.log(err);
        res.status(500).render("frontend/404");
    }
};








module.exports  =  { salesReport , generatePDF  ,generateExcel } ;