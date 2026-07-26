CREATE DATABASE EcommerceApp;
GO
USE EcommerceApp;
-- Create login for the application
CREATE LOGIN sales_user 
WITH PASSWORD = 'sales123', 
CHECK_POLICY = OFF;
GO

-- Switch to your database
USE EcommerceApp;
GO

-- Create user and grant permissions
CREATE USER sales_user FOR LOGIN sales_user;
GO

-- Grant full permissions (for Admin access)
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::dbo TO sales_user;
GO
-- create tables here



CREATE TABLE Person (
    PersonID INT PRIMARY KEY,
    Name VARCHAR(100),
    Age INT,
    Gender VARCHAR(10),
    Contact VARCHAR(15)
);
CREATE TABLE Category (
    CategoryID INT PRIMARY KEY,
    CategoryName VARCHAR(30)
);
CREATE TABLE Products (
    ProductID INT PRIMARY KEY,
    ProductName VARCHAR(50),
    CategoryID INT,
    Price DECIMAL(10,2),
    Stock INT,
    ManufactureDate DATE,
    WarrantyExpiry DATE,
    FOREIGN KEY (CategoryID) REFERENCES Category(CategoryID)
);
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY,
    PersonID INT,
    FOREIGN KEY (PersonID) REFERENCES Person(PersonID)
);
CREATE TABLE Roles (
    RoleID INT PRIMARY KEY,
    RoleName VARCHAR(15),
    RoleDescription VARCHAR(50)
);
CREATE TABLE Staff (
    StaffID INT PRIMARY KEY,
    RoleID INT,
    PersonID INT,
    FOREIGN KEY (RoleID) REFERENCES Roles(RoleID),
    FOREIGN KEY (PersonID) REFERENCES Person(PersonID)
);
CREATE TABLE Sales (
    SaleID INT PRIMARY KEY,
    ProductID INT,
    CustomerID INT,
    StaffID INT,
    Quantity INT,
    SaleDate DATE,
    TotalAmount DECIMAL(10,2),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID),
    FOREIGN KEY (StaffID) REFERENCES Staff(StaffID)
);
CREATE TABLE Invoice (
    InvoiceID INT PRIMARY KEY,
    SaleID INT,
    InvoiceDate DATE,
    PaymentMethod VARCHAR(20),
    FOREIGN KEY (SaleID) REFERENCES Sales(SaleID)
);

CREATE OR ALTER PROCEDURE AddPerson
    @PersonID INT,
    @Name VARCHAR(100),
    @Age INT,
    @Gender VARCHAR(10),
    @Contact VARCHAR(15)
AS
BEGIN
    INSERT INTO Person VALUES (@PersonID, @Name, @Age, @Gender, @Contact);
END;
GO

CREATE OR ALTER PROCEDURE AddCategory
    @CategoryID INT,
    @CategoryName VARCHAR(30)
AS
BEGIN
    INSERT INTO Category VALUES (@CategoryID, @CategoryName);
END;
GO

CREATE OR ALTER PROCEDURE AddProduct
    @ProductID INT,
    @ProductName VARCHAR(50),
    @CategoryID INT,
    @Price DECIMAL(10,2),
    @Stock INT,
    @ManufactureDate DATE,
    @WarrantyExpiry DATE
AS
BEGIN
    INSERT INTO Products VALUES (@ProductID, @ProductName, @CategoryID, @Price, @Stock, @ManufactureDate, @WarrantyExpiry);
END;
GO

CREATE OR ALTER PROCEDURE AddCustomer
    @CustomerID INT,
    @PersonID INT
AS
BEGIN
    INSERT INTO Customers VALUES (@CustomerID, @PersonID);
END;
GO

CREATE OR ALTER PROCEDURE AddRole
    @RoleID INT,
    @RoleName VARCHAR(15),
    @RoleDescription VARCHAR(50)
AS
BEGIN
    INSERT INTO Roles VALUES (@RoleID, @RoleName, @RoleDescription);
END;
GO

CREATE OR ALTER PROCEDURE AddStaff
    @StaffID INT,
    @RoleID INT,
    @PersonID INT
AS
BEGIN
    INSERT INTO Staff VALUES (@StaffID, @RoleID, @PersonID);
END;
GO

CREATE OR ALTER PROCEDURE AddSale
    @SaleID INT,
    @ProductID INT,
    @CustomerID INT,
    @StaffID INT,
    @Quantity INT,
    @SaleDate DATE,
    @TotalAmount DECIMAL(10,2)
AS
BEGIN
    INSERT INTO Sales VALUES (@SaleID, @ProductID, @CustomerID, @StaffID, @Quantity, @SaleDate, @TotalAmount);
END;
GO

CREATE OR ALTER PROCEDURE AddInvoice
    @InvoiceID INT,
    @SaleID INT,
    @InvoiceDate DATE,
    @PaymentMethod VARCHAR(20)
AS
BEGIN
    INSERT INTO Invoice VALUES (@InvoiceID, @SaleID, @InvoiceDate, @PaymentMethod);
END;
GO

CREATE OR ALTER PROCEDURE UpdatePersonContact
    @PersonID INT,
    @NewContact VARCHAR(15)
AS
BEGIN
    UPDATE Person SET Contact = @NewContact WHERE PersonID = @PersonID;
END;
GO



SELECT * FROM Person;
SELECT * FROM Category;
SELECT * FROM Products;
SELECT * FROM Customers;
SELECT * FROM Roles;
SELECT * FROM Staff;
SELECT * FROM Sales;
SELECT * FROM Invoice;

/* DELETE FROM Invoice;
DELETE FROM Sales;
DELETE FROM Staff;
DELETE FROM Roles;
DELETE FROM Customers;
DELETE FROM Products;
DELETE FROM Category;
DELETE FROM Person;

DROP TABLE Invoice;
DROP TABLE Sales;
DROP TABLE Staff;
DROP TABLE Roles;
DROP TABLE Customers;
DROP TABLE Products;
DROP TABLE Category;
DROP TABLE Person;


DROP TABLE IF EXISTS Invoice;
DROP TABLE IF EXISTS Sales;
DROP TABLE IF EXISTS Staff;
DROP TABLE IF EXISTS Roles;
DROP TABLE IF EXISTS Customers;
DROP TABLE IF EXISTS Products;
DROP TABLE IF EXISTS Category;
DROP TABLE IF EXISTS Person; */
USE master;
GO

/*-- Remove old user if exists
IF EXISTS (SELECT * FROM sys.server_principals WHERE name = 'SalesUser')
DROP LOGIN SalesUser;
GO

-- Create Sales login
CREATE LOGIN SalesUser 
WITH PASSWORD = 'Sales@123', CHECK_POLICY = OFF;
GO

USE EcommerceApp;
GO

-- Remove old database user if exists
IF EXISTS (SELECT * FROM sys.database_principals WHERE name = 'SalesUser')
DROP USER SalesUser;
GO

-- Create database user
CREATE USER SalesUser FOR LOGIN SalesUser;
GO

-- Allow read on everything
GRANT SELECT ON SCHEMA::dbo TO SalesUser;
GO

-- Allow Sales & Invoice only
GRANT INSERT, DELETE ON dbo.Sales TO SalesUser;
GRANT INSERT, DELETE ON dbo.Invoice TO SalesUser;
GO

-- Block everything else
DENY INSERT, UPDATE, DELETE ON dbo.Person TO SalesUser;
DENY INSERT, UPDATE, DELETE ON dbo.Category TO SalesUser;
DENY INSERT, UPDATE, DELETE ON dbo.Products TO SalesUser;
DENY INSERT, UPDATE, DELETE ON dbo.Customers TO SalesUser;
DENY INSERT, UPDATE, DELETE ON dbo.Roles TO SalesUser;
DENY INSERT, UPDATE, DELETE ON dbo.Staff TO SalesUser;
GO
*/

USE EcommerceApp;

-- Add Categories
EXEC AddCategory 1, 'Electronics';
EXEC AddCategory 2, 'Clothing';
EXEC AddCategory 3, 'Books';

-- Add People
EXEC AddPerson 1, 'John Doe', 30, 'Male', '555-0101';
EXEC AddPerson 2, 'Jane Smith', 25, 'Female', '555-0102';
EXEC AddPerson 3, 'Bob Johnson', 35, 'Male', '555-0103';

-- Add Customers
EXEC AddCustomer 1, 1;
EXEC AddCustomer 2, 2;

-- Add Roles
EXEC AddRole 1, 'Manager', 'Store Manager';
EXEC AddRole 2, 'Sales Rep', 'Sales Representative';

-- Add Staff
EXEC AddStaff 1, 1, 3;

-- Add Products
EXEC AddProduct 1, 'Laptop', 1, 999.99, 10, '2024-01-01', '2026-01-01';
EXEC AddProduct 2, 'T-Shirt', 2, 19.99, 50, '2024-06-01', '2025-06-01';
EXEC AddProduct 3, 'SQL Book', 3, 49.99, 20, '2024-03-01', '2025-03-01';

-- Add Sales
EXEC AddSale 1, 1, 1, 1, 1, '2024-01-15', 999.99;
EXEC AddSale 2, 2, 2, 1, 3, '2024-01-16', 59.97;

-- Add Invoices
EXEC AddInvoice 1, 1, '2024-01-15', 'Credit Card';
EXEC AddInvoice 2, 2, '2024-01-16', 'Cash';