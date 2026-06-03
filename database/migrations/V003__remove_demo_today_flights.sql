-- =====================================================
-- Migration V003: Remove obsolete DEMO-TODAY flights
-- =====================================================
-- Cleans local/demo flight rows and dependent data created with
-- MaChuyenBayCode like DEMO-TODAY%.
-- =====================================================

DECLARE @Flights TABLE (MaChuyenBay INT PRIMARY KEY);
DECLARE @Tickets TABLE (MaVe INT PRIMARY KEY);
DECLARE @Bookings TABLE (MaPhieuDatCho INT PRIMARY KEY);
DECLARE @Baggage TABLE (MaGoiHanhLy INT PRIMARY KEY);

INSERT INTO @Flights (MaChuyenBay)
SELECT MaChuyenBay
FROM dbo.CHUYENBAY
WHERE MaChuyenBayCode LIKE 'DEMO-TODAY%';

INSERT INTO @Tickets (MaVe)
SELECT MaVe
FROM dbo.VE
WHERE MaChuyenBay IN (SELECT MaChuyenBay FROM @Flights);

INSERT INTO @Bookings (MaPhieuDatCho)
SELECT MaPhieuDatCho
FROM dbo.PHIEUDATCHO
WHERE MaChuyenBay IN (SELECT MaChuyenBay FROM @Flights);

INSERT INTO @Baggage (MaGoiHanhLy)
SELECT MaGoiHanhLy
FROM dbo.GOIHANHLY
WHERE MaVe IN (SELECT MaVe FROM @Tickets);

DELETE FROM dbo.KIENHANHLY
WHERE MaGoiHanhLy IN (SELECT MaGoiHanhLy FROM @Baggage);

DELETE FROM dbo.GOIHANHLY
WHERE MaGoiHanhLy IN (SELECT MaGoiHanhLy FROM @Baggage);

DELETE FROM dbo.CHECKIN
WHERE MaVe IN (SELECT MaVe FROM @Tickets);

DELETE FROM dbo.THANHTOAN
WHERE MaVe IN (SELECT MaVe FROM @Tickets)
   OR MaPhieuDatCho IN (SELECT MaPhieuDatCho FROM @Bookings);

DELETE FROM dbo.VE
WHERE MaVe IN (SELECT MaVe FROM @Tickets);

DELETE FROM dbo.PHIEUDATCHO
WHERE MaPhieuDatCho IN (SELECT MaPhieuDatCho FROM @Bookings);

DELETE FROM dbo.TRUNGGIAN
WHERE MaChuyenBay IN (SELECT MaChuyenBay FROM @Flights);

DELETE FROM dbo.CT_HANGVE
WHERE MaChuyenBay IN (SELECT MaChuyenBay FROM @Flights);

IF OBJECT_ID(N'dbo.tr_CHUYENBAY_PreventDelete', N'TR') IS NOT NULL
    DISABLE TRIGGER dbo.tr_CHUYENBAY_PreventDelete ON dbo.CHUYENBAY;

DELETE FROM dbo.CHUYENBAY
WHERE MaChuyenBay IN (SELECT MaChuyenBay FROM @Flights);

IF OBJECT_ID(N'dbo.tr_CHUYENBAY_PreventDelete', N'TR') IS NOT NULL
    ENABLE TRIGGER dbo.tr_CHUYENBAY_PreventDelete ON dbo.CHUYENBAY;

PRINT N'V003: Removed DEMO-TODAY flights and dependent rows.';
GO
