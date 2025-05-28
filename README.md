# Kamal Motor Sales & Employee Management System (Group 11)

This is a full-stack MERN (MongoDB, Express.js, React.js, Node.js) web application developed by Group 11 for Kamal Motor. The system streamlines sales, inventory, and employee management processes while allowing customers to place online orders. It supports multiple user roles (Owner, Employee, Customer) and includes QR code-based attendance tracking, automated salary generation, real-time reporting, and low-stock notifications.

## Key Features

- Real-time inventory and stock alerts
- QR code attendance system
- Automated salary calculations
- Online customer order placement
- Multi-branch support
- Daily, weekly, and monthly reporting

## Developed by:
  
- P.N. Rathnayaka – SC/2021/12106 
- I.M.P. Idusara – SC/2021/12129 
- K.A.K. Sanjana – SC/2021/12124  
- G.C.L. Siriwardhana – SC/2021/12173  
- S.M.H.U.D. De Silva – SC/2021/12186  
- A.C.M. Ariyathilaka – SC/2021/12151  
- T.A. Rajapaksha – SC/2021/12144




kamal-motor-management-system/
│
├── client/                                # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                        # Images, logos, styles
│   │   ├── components/                   # Reusable components
│   │   ├── interfaces/                   # Role-based dashboards
│   │   │   ├── Customer/
│   │   │   ├── Owner/
│   │   │   ├── Employee/
│   │   │   └── Delivery/
│   │   ├── pages/                        # Page-level components (Login, Home, etc.)
│   │   ├── routes/                       # React Router config
│   │   ├── services/                     # API calls
│   │   ├── context/                      # Auth & global state
│   │   ├── utils/                        # Helper functions
│   │   └── App.js                        # Root React component
│   └── package.json
│
├── server/                                # Node.js + Express Backend
│   ├── config/                            # DB & environment config
│   ├── controllers/                       # Business logic
│   ├── middleware/                        # Auth, error handling
│   ├── models/                            # MongoDB models (Mongoose schemas)
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Attendance.js
│   │   ├── Salary.js
│   │   ├── Branch.js
│   │   └── Delivery.js
│   ├── routes/                            # API routes
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── salaryRoutes.js
│   │   └── deliveryRoutes.js
│   ├── utils/                             # QR generation, validations, etc.
│   └── server.js                          # Entry point
│
├── shared/                                # Shared resources
│   ├── constants/
│   ├── validations/
│   └── helpers/
│
├── .env.example                           # Sample environment variables
├── .gitignore
├── README.md
├── package.json                           # If managing scripts from root
├── docs/                                  # Project documentation
│   ├── proposal.pdf
│   ├── Gantt-chart.png
│   ├── db-schema.png
│   └── diagrams/
│       ├── manual-flow.png
│       └── system-architecture.png
└── README.md
