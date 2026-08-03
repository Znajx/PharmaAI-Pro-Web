export const SQL_SERVER_SCRIPT = `-- ===============================================================================
-- PROJECT: PharmaCare AI & Management System (مشروع تخرج إدارة الصيدلية والذكاء الاصطناعي)
-- TARGET DATABASE ENGINE: Microsoft SQL Server 2012 / 2014 / 2016 / 2019 / 2022
-- INTEGRATION READY: Visual Studio 2012 & Visual Studio 2022 (ASP.NET Core / Entity Framework Core)
-- AUTHOR: Graduation Team & Google AI Studio
-- ===============================================================================

USE master;
GO

IF EXISTS (SELECT * FROM sys.databases WHERE name = 'PharmaCareDB')
BEGIN
    ALTER DATABASE PharmaCareDB SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE PharmaCareDB;
END
GO

CREATE DATABASE PharmaCareDB;
GO

USE PharmaCareDB;
GO

-- ===============================================================================
-- 1. TABLES DEFINITION (الجداول الأساسية)
-- ===============================================================================

-- Roles Table
CREATE TABLE Roles (
    RoleId INT IDENTITY(1,1) PRIMARY KEY,
    RoleName NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(250) NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Users Table
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(256) NOT NULL,
    RoleId INT NOT NULL,
    PhoneNumber NVARCHAR(20) NULL,
    LicenseNumber NVARCHAR(50) NULL,
    AvatarUrl NVARCHAR(500) NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Users_Roles FOREIGN KEY (RoleId) REFERENCES Roles(RoleId)
);

-- Suppliers Table
CREATE TABLE Suppliers (
    SupplierId INT IDENTITY(1,1) PRIMARY KEY,
    SupplierName NVARCHAR(150) NOT NULL,
    CompanyName NVARCHAR(150) NOT NULL,
    ContactPerson NVARCHAR(100) NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    Email NVARCHAR(100) NULL,
    Address NVARCHAR(250) NULL,
    Rating DECIMAL(3,2) DEFAULT 5.0,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Patients Table
CREATE TABLE Patients (
    PatientId INT IDENTITY(1,1) PRIMARY KEY,
    FullName NVARCHAR(100) NOT NULL,
    Age INT NOT NULL,
    Gender NVARCHAR(10) CHECK (Gender IN (N'ذكر', N'أنثى')),
    PhoneNumber NVARCHAR(20) NOT NULL,
    Email NVARCHAR(100) NULL,
    BloodGroup NVARCHAR(5) NULL,
    Allergies NVARCHAR(MAX) NULL, -- comma separated or JSON
    ChronicDiseases NVARCHAR(MAX) NULL,
    KidneyImpairment BIT DEFAULT 0,
    LiverImpairment BIT DEFAULT 0,
    IsPregnant BIT DEFAULT 0,
    WeightKg DECIMAL(5,2) NULL,
    MedicalNotes NVARCHAR(MAX) NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Medicines / Inventory Table
CREATE TABLE Medicines (
    MedicineId INT IDENTITY(1,1) PRIMARY KEY,
    TradeName NVARCHAR(150) NOT NULL,
    ScientificName NVARCHAR(200) NOT NULL,
    Category NVARCHAR(100) NOT NULL,
    Barcode NVARCHAR(50) NOT NULL UNIQUE,
    QRCode NVARCHAR(100) NULL,
    Price DECIMAL(18,2) NOT NULL,
    CostPrice DECIMAL(18,2) NOT NULL,
    CurrentStock INT NOT NULL DEFAULT 0,
    MinStockThreshold INT NOT NULL DEFAULT 10,
    Unit NVARCHAR(50) NOT NULL,
    BatchNumber NVARCHAR(50) NOT NULL,
    ProductionDate DATE NULL,
    ExpiryDate DATE NOT NULL,
    SupplierId INT NULL,
    Manufacturer NVARCHAR(100) NOT NULL,
    ActiveIngredients NVARCHAR(MAX) NULL,
    DosageForm NVARCHAR(100) NULL,
    UsageInstructions NVARCHAR(MAX) NULL,
    SideEffects NVARCHAR(MAX) NULL,
    Contraindications NVARCHAR(MAX) NULL,
    RequiresPrescription BIT DEFAULT 0,
    ImageUrl NVARCHAR(500) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Medicines_Suppliers FOREIGN KEY (SupplierId) REFERENCES Suppliers(SupplierId) ON DELETE SET NULL
);

-- Prescriptions Table
CREATE TABLE Prescriptions (
    PrescriptionId INT IDENTITY(1,1) PRIMARY KEY,
    DoctorName NVARCHAR(100) NOT NULL,
    DoctorSpecialty NVARCHAR(100) NULL,
    PatientId INT NOT NULL,
    IssueDate DATE DEFAULT GETDATE(),
    Diagnosis NVARCHAR(MAX) NULL,
    Notes NVARCHAR(MAX) NULL,
    PrescriptionImageUrl NVARCHAR(500) NULL,
    Status NVARCHAR(20) DEFAULT N'active' CHECK (Status IN (N'active', N'dispensed', N'expired')),
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Prescriptions_Patients FOREIGN KEY (PatientId) REFERENCES Patients(PatientId)
);

-- Prescription Items Table
CREATE TABLE PrescriptionItems (
    PrescriptionItemId INT IDENTITY(1,1) PRIMARY KEY,
    PrescriptionId INT NOT NULL,
    MedicineName NVARCHAR(150) NOT NULL,
    Dosage NVARCHAR(100) NOT NULL,
    Frequency NVARCHAR(100) NOT NULL,
    Duration NVARCHAR(50) NOT NULL,
    Instructions NVARCHAR(MAX) NULL,
    Quantity INT NOT NULL DEFAULT 1,
    CONSTRAINT FK_PrescriptionItems_Prescriptions FOREIGN KEY (PrescriptionId) REFERENCES Prescriptions(PrescriptionId) ON DELETE CASCADE
);

-- Sales Header Table (Invoices / POS)
CREATE TABLE Sales (
    SaleId INT IDENTITY(1,1) PRIMARY KEY,
    InvoiceNumber NVARCHAR(50) NOT NULL UNIQUE,
    SaleDate DATETIME DEFAULT GETDATE(),
    PatientId INT NULL,
    PharmacistUserId INT NOT NULL,
    Subtotal DECIMAL(18,2) NOT NULL,
    Tax DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    Discount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    GrandTotal DECIMAL(18,2) NOT NULL,
    PaymentMethod NVARCHAR(20) CHECK (PaymentMethod IN (N'cash', N'card', N'insurance')),
    Status NVARCHAR(20) DEFAULT N'completed' CHECK (Status IN (N'completed', N'returned', N'cancelled')),
    CONSTRAINT FK_Sales_Patients FOREIGN KEY (PatientId) REFERENCES Patients(PatientId),
    CONSTRAINT FK_Sales_Users FOREIGN KEY (PharmacistUserId) REFERENCES Users(UserId)
);

-- Sales Detail Table
CREATE TABLE SaleItems (
    SaleItemId INT IDENTITY(1,1) PRIMARY KEY,
    SaleId INT NOT NULL,
    MedicineId INT NOT NULL,
    UnitPrice DECIMAL(18,2) NOT NULL,
    Quantity INT NOT NULL,
    Discount DECIMAL(18,2) DEFAULT 0.00,
    LineTotal DECIMAL(18,2) NOT NULL,
    CONSTRAINT FK_SaleItems_Sales FOREIGN KEY (SaleId) REFERENCES Sales(SaleId) ON DELETE CASCADE,
    CONSTRAINT FK_SaleItems_Medicines FOREIGN KEY (MedicineId) REFERENCES Medicines(MedicineId)
);

-- Medication Reminders Table
CREATE TABLE MedicationReminders (
    ReminderId INT IDENTITY(1,1) PRIMARY KEY,
    PatientId INT NOT NULL,
    MedicineName NVARCHAR(150) NOT NULL,
    Dosage NVARCHAR(100) NOT NULL,
    ReminderTime NVARCHAR(10) NOT NULL, -- Format HH:mm
    FrequencyDays NVARCHAR(50) NOT NULL,
    TakenToday BIT DEFAULT 0,
    Instructions NVARCHAR(250) NULL,
    CreatedAt DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Reminders_Patients FOREIGN KEY (PatientId) REFERENCES Patients(PatientId) ON DELETE CASCADE
);

-- AI Audit & Log History Table
CREATE TABLE AIAnalysisLogs (
    LogId INT IDENTITY(1,1) PRIMARY KEY,
    UserId INT NULL,
    AnalysisType NVARCHAR(50) NOT NULL, -- Symptom, OCR, Interaction, Lab, Radiology, Chat
    InputPayload NVARCHAR(MAX) NOT NULL,
    AIOutputResponse NVARCHAR(MAX) NOT NULL,
    ConfidenceScore DECIMAL(5,2) NULL,
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- ===============================================================================
-- 2. INDEXES FOR PERFORMANCE (فهارس سرعة الاستعلامات)
-- ===============================================================================
CREATE INDEX IX_Medicines_Barcode ON Medicines(Barcode);
CREATE INDEX IX_Medicines_TradeName ON Medicines(TradeName);
CREATE INDEX IX_Medicines_ExpiryDate ON Medicines(ExpiryDate);
CREATE INDEX IX_Sales_InvoiceNumber ON Sales(InvoiceNumber);
CREATE INDEX IX_Sales_SaleDate ON Sales(SaleDate);
CREATE INDEX IX_Patients_Phone ON Patients(PhoneNumber);

-- ===============================================================================
-- 3. STORED PROCEDURES (الإجراءات المخزنة الاحترافية)
-- ===============================================================================

GO
-- Procedure 1: Get Low Stock & Expiring Medicines Alert
CREATE PROCEDURE sp_GetInventoryAlerts
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Low Stock Alert
    SELECT 'LOW_STOCK' AS AlertType, MedicineId, TradeName, CurrentStock, MinStockThreshold, ExpiryDate
    FROM Medicines
    WHERE CurrentStock <= MinStockThreshold;

    -- Expiring Soon (Within 90 Days)
    SELECT 'EXPIRING_SOON' AS AlertType, MedicineId, TradeName, CurrentStock, BatchNumber, ExpiryDate
    FROM Medicines
    WHERE ExpiryDate <= DATEADD(day, 90, GETDATE());
END;
GO

-- Procedure 2: Create Sale Transaction & Auto Deduct Stock
CREATE PROCEDURE sp_CreateSaleTransaction
    @InvoiceNumber NVARCHAR(50),
    @PatientId INT = NULL,
    @PharmacistUserId INT,
    @Subtotal DECIMAL(18,2),
    @Tax DECIMAL(18,2),
    @Discount DECIMAL(18,2),
    @GrandTotal DECIMAL(18,2),
    @PaymentMethod NVARCHAR(20),
    @NewSaleId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        INSERT INTO Sales (InvoiceNumber, PatientId, PharmacistUserId, Subtotal, Tax, Discount, GrandTotal, PaymentMethod, Status)
        VALUES (@InvoiceNumber, @PatientId, @PharmacistUserId, @Subtotal, @Tax, @Discount, @GrandTotal, @PaymentMethod, N'completed');
        
        SET @NewSaleId = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END;
GO

-- Procedure 3: Smart Search Medicines by Barcode, QR or Name
CREATE PROCEDURE sp_SearchMedicinesSmart
    @SearchQuery NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT * 
    FROM Medicines
    WHERE Barcode = @SearchQuery 
       OR QRCode = @SearchQuery 
       OR TradeName LIKE '%' + @SearchQuery + '%'
       OR ScientificName LIKE '%' + @SearchQuery + '%'
       OR ActiveIngredients LIKE '%' + @SearchQuery + '%';
END;
GO

-- ===============================================================================
-- 4. SEED DATA (البيانات الأولية للتجربة)
-- ===============================================================================
INSERT INTO Roles (RoleName, Description) VALUES 
(N'admin', N'المدير العام للنظام والصيدلية'),
(N'pharmacist', N'الصيدلي مسؤول المبيعات والصرف'),
(N'patient', N'المريض مستخدم تطبيق الرعاية');

INSERT INTO Users (FullName, Email, PasswordHash, RoleId, PhoneNumber, LicenseNumber) VALUES
(N'د. عبد الله المنصوري', N'admin@pharmacare.ai', N'AQAAAAEAACcQAAAAE...', 1, N'+966501234567', N'LIC-ADM-001'),
(N'د. سارة الأحمد', N'pharmacist@pharmacare.ai', N'AQAAAAEAACcQAAAAE...', 2, N'+966559876543', N'LIC-PH-002'),
(N'أحمد محمود العتيبي', N'patient@pharmacare.ai', N'AQAAAAEAACcQAAAAE...', 3, N'+966543210987', NULL);

INSERT INTO Suppliers (SupplierName, CompanyName, ContactPerson, PhoneNumber, Email, Address, Rating) VALUES
(N'شركة فارما ميد للخدمات الطبية', N'PharmaMed International', N'عمر خالد', N'+966112345678', N'orders@pharmamed.com', N'الرياض - المنطقة الصناعية الثانية', 4.9),
(N'مؤسسة الشفاء لتوريد الأدوية', N'Al-Shifa Supplies', N'فاطمة الزهراء', N'+966126789012', N'sales@alshifa.com', N'جدة - شارع التحلية', 4.7);

INSERT INTO Medicines (TradeName, ScientificName, Category, Barcode, QRCode, Price, CostPrice, CurrentStock, MinStockThreshold, Unit, BatchNumber, ExpiryDate, SupplierId, Manufacturer, ActiveIngredients, DosageForm, UsageInstructions, RequiresPrescription) VALUES
(N'بانادول اكسترا', N'Paracetamol + Caffeine', N'مسكنات', N'6291100123456', N'QR-PAN-500', 18.50, 12.00, 145, 30, N'علبة (24 قرص)', N'BT-2025-091', '2027-01-10', 1, N'GSK', N'Paracetamol, Caffeine', N'أقراص', N'قرصين كل 6-8 ساعات', 0),
(N'أوجمنتين 1 جرام', N'Amoxicillin + Clavulanate', N'مضادات حيوية', N'6291100654321', N'QR-AUG-1G', 76.00, 55.00, 28, 20, N'علبة (14 قرص)', N'BT-2024-882', '2026-09-30', 1, N'GSK', N'Amoxicillin, Clavulanic Acid', N'أقراص مغلفة', N'قرص كل 12 ساعة مع الوجبة', 1),
(N'جلوكوفاج 500 ملغم', N'Metformin HCl 500mg', N'أدوية السكري', N'6291100998877', N'QR-GLU-500', 24.00, 16.50, 12, 25, N'علبة (50 قرص)', N'BT-2024-331', '2026-08-30', 2, N'Merck', N'Metformin', N'أقراص', N'قرص مع الوجبة الرئيسية', 1);
`;

export const VISUAL_STUDIO_GUIDE = `
# دليل تشغيل وقاعدة بيانات المشروع على Visual Studio 2012 / 2022

## 1. إنشاء قاعدة البيانات في SQL Server Management Studio (SSMS)
1. افتح برنامج **SQL Server Management Studio (SSMS)** المتصل بـ SQL Server الخاص بك.
2. انقر على **New Query** وانسخ سكريبت T-SQL المرفق أعلاه.
3. اضغط على **Execute (F5)** لإنشاء قاعدة البيانات \`PharmaCareDB\` والداول والإجراءات المخزنة.

---

## 2. الربط مع مشروع Visual Studio 2022 / 2012 (ASP.NET Core / C# Web API)

### أ) Connection String (في ملف appsettings.json):
\`\`\`json
{
  "ConnectionStrings": {
    "PharmaCareConnection": "Server=localhost;Database=PharmaCareDB;Trusted_Connection=True;TrustServerCertificate=True;"
  }
}
\`\`\`

### ب) نموذج Entity Framework Core (DbSet / Models in C#):
\`\`\`csharp
public class PharmaCareDbContext : DbContext
{
    public PharmaCareDbContext(DbContextOptions<PharmaCareDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Role> Roles { get; set; }
    public DbSet<Medicine> Medicines { get; set; }
    public DbSet<Supplier> Suppliers { get; set; }
    public DbSet<Patient> Patients { get; set; }
    public DbSet<Prescription> Prescriptions { get; set; }
    public DbSet<Sale> Sales { get; set; }
    public DbSet<SaleItem> SaleItems { get; set; }
    public DbSet<MedicationReminder> MedicationReminders { get; set; }
    public DbSet<AIAnalysisLog> AIAnalysisLogs { get; set; }
}
\`\`\`

### ج) وحدة التحكم بالصيدلية (MedicinesController.cs Sample for VS 2012 / 2022):
\`\`\`csharp
[ApiController]
[Route("api/[controller]")]
public class MedicinesController : ControllerBase
{
    private readonly PharmaCareDbContext _context;

    public MedicinesController(PharmaCareDbContext context)
    {
        _context = context;
    }

    [HttpGet("search/{query}")]
    public async Task<IActionResult> SearchMedicines(string query)
    {
        var results = await _context.Medicines
            .Where(m => m.Barcode == query || m.TradeName.Contains(query) || m.ScientificName.Contains(query))
            .ToListAsync();
        return Ok(results);
    }
}
\`\`\`
`;
