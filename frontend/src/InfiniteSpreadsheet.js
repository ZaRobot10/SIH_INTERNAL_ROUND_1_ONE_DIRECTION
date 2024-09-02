// import React, { useRef, useState, useEffect } from 'react';
// import Handsontable from 'handsontable';
// import 'handsontable/dist/handsontable.full.css';
// import io from 'socket.io-client';

// // Replace with your actual sheet ID or extract it from the URL or state
// const sheetId = 60;
// console.log(sheetId);

// // Connect to the Socket.IO server
// const socket = io('http://192.168.1.14:5001');

// const TableComponent = () => {
//     const containerRef = useRef(null);
//     const hotRef = useRef(null);

//     const initialData = Array.from({ length: 100 }, () => Array(26).fill(''));
//     const columnHeaders = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

//     const [data, setData] = useState(initialData);
//     const isRemoteUpdate = useRef(false);

//     // Join the specific sheet room when the component mounts
//     useEffect(() => {
//         socket.emit('join-sheet', sheetId);
//     }, []);

//     // Initialize Handsontable
//     useEffect(() => {
//         if (containerRef.current) {
//             hotRef.current = new Handsontable(containerRef.current, {
//                 data,
//                 colHeaders: columnHeaders,
//                 columns: Array.from({ length: 26 }, (_, i) => ({ data: i })),
//                 rowHeaders: true,
//                 stretchH: 'all',
//                 width: '100%',
//                 height: '100%',
//                 licenseKey: 'non-commercial-and-evaluation',
//                 afterChange: (changes) => {
//                     if (changes && !isRemoteUpdate.current) {
//                         changes.forEach(([row, col, , value]) => {
//                             // Emit the cell update event with sheetId, row, col, and value
                        
//                             socket.emit('cell-update', { sheetId, row, col, value });
//                         });
//                     }
//                 },
//             });
//         }

//         // Listen for cell updates from the server
//         socket.on('cell-update', ({ row, col, value }) => {
//             isRemoteUpdate.current = true;

//             if (hotRef.current) {
//                 hotRef.current.setDataAtCell(row, col, value);
//             }

//             // Reset the flag after the update is applied
//             isRemoteUpdate.current = false;
//         });

//         return () => {
//             // Clean up on unmount
//             socket.off('cell-update');
//         };
//     }, [data]);

//     return <div ref={containerRef} style={{ minHeight: '1000px' }}></div>;
// };

// export default TableComponent;
