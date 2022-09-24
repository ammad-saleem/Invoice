CREATE TABLE [dbo].[drugs](
	[ID] [int] not null identity(1,1),
	[Name] [nvarchar](100) NULL,
	[Formula] [nvarchar](255) NULL,
	[Enabled] [tinyint] not NULL default 0,
	[DDC_CODE] [nvarchar](50) NULL,
	[SCIENTIFIC_CODE] [nvarchar](50) NULL,
	[INGREDIENT_STRENGTH] [nvarchar](255) NULL,
	[DOSAGE_FORM_PACKAGE] [nvarchar](255) NULL,
	[MANUFACTURER] [nvarchar](255) NULL
) ON [PRIMARY]

insert into drugs (Name,Formula,Enabled,DDC_CODE,SCIENTIFIC_CODE,INGREDIENT_STRENGTH,DOSAGE_FORM_PACKAGE,MANUFACTURER) values 
('DEXTRAN 40 IN DEXTROSE','(DEXTROSE : 50 MG/ML) (DEXTRAN 40 : 100 MG/ML)  SOLUTION FOR INFUSION','0','0002-309503-1001','309503-100','DEXTROSE/DEXTRAN 40 [50 MG/ML|100 MG/ML]','SOLUTION FOR INFUSION (500ML, PLASTIC BOTTLE)','PHARMACEUTICAL SOLUTION INDUSTRIES LTD., SAUDI ARABIA');
insert into drugs (Name,Formula,Enabled,DDC_CODE,SCIENTIFIC_CODE,INGREDIENT_STRENGTH,DOSAGE_FORM_PACKAGE,MANUFACTURER) values 
('123 COLD','(CARBINOXAMINE : N/A) (PHENYLEPHRINE : N/A) (CODEINE : N/A) (CAFFEINE : N/A) (PARACETAMOL : N/A)  TABLETS','0','0003-100301-1171','100301-117','CARBINOXAMINE/PHENYLEPHRINE/CODEINE/CAFFEINE/PARACETAMOL [N/A|N/A|N/A|N/A|N/A]','TABLETS (16''S, BOX)','ALGORITHM S.A.L., LEBANON');
insert into drugs (Name,Formula,Enabled,DDC_CODE,SCIENTIFIC_CODE,INGREDIENT_STRENGTH,DOSAGE_FORM_PACKAGE,MANUFACTURER) values 
('21ST CENTURY ACE ANTI OXIDANT','(ZINC : N/A) (TOCOPHEROL : N/A) (ASCORBIC ACID (VITAMIN C) : N/A) (VITAMIN A : N/A) (SELENIUM : N/A) (COPPER : N/A) (MANGANESE : N/A)  TABLETS','0','0004-100401-1171','100401-117','ZINC/TOCOPHEROL/ASCORBIC ACID (VITAMIN C)/VITAMIN A/SELENIUM/COPPER/MANGANESE [N/A|N/A|N/A|N/A|N/A|N/A|N/A]','TABLETS (75''S, BOTTLE)','21ST CENTURY HEALTH CARE, USA');
insert into drugs (Name,Formula,Enabled,DDC_CODE,SCIENTIFIC_CODE,INGREDIENT_STRENGTH,DOSAGE_FORM_PACKAGE,MANUFACTURER) values 
('21ST CENTURY B COMPLEX WITH C','(VITAMIN B COMPLEX : N/A) (ASCORBIC ACID (VITAMIN C) : N/A)  TABLETS','0','0004-100501-1171','100501-117','VITAMIN B COMPLEX/ASCORBIC ACID (VITAMIN C) [N/A|N/A]','TABLETS (100''S, BOTTLE)','21ST CENTURY HEALTH CARE, USA');


CREATE TABLE [dbo].[DRUGS](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[NAME] [varchar](256) NOT NULL
);

ALTER TABLE [dbo].[DRUGS]
ADD PRIMARY KEY (ID);

insert into dbo.DRUGS VALUES 
	('Paracetamol | 5mg'),
	('Ibuprofen | 500mg'),
	('Omeprazole | 20mg');

CREATE TABLE [dbo].[FREQUENCY](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[FREQUENCY] [varchar](50) NOT NULL
);

ALTER TABLE [dbo].[FREQUENCY]
ADD PRIMARY KEY (ID);

insert into dbo.FREQUENCY VALUES 
	('once a day'),
	('twice a day'),
	('thrice a day');

CREATE TABLE [dbo].[ROUTE](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[ROUTE] [varchar](50) NOT NULL
);
ALTER TABLE [dbo].[ROUTE]
ADD PRIMARY KEY (ID);

insert into dbo.ROUTE VALUES 
	('oral'),
	('intermuscular injection'),
	('arterial injection');

create table route (id int not null identity(1,1), code varchar(10), route varchar(100), enabled tinyint)

insert into ROUTE (code, route, enabled) values ('ROA000','N/A',0)
insert into ROUTE (code, route, enabled) values ('ROA096','Transmucosal',0)
insert into ROUTE (code, route, enabled) values ('ROA001','Dental',0)

CREATE TABLE [dbo].[Prescription](
	[ID] [int] IDENTITY(1,1) NOT NULL,
	[PATIENT_ID] [int] NOT NULL,
	[PATIENT_NAME] [nvarchar](300) NOT NULL,
	[CREATED_ON] [datetime] NOT NULL 
);

ALTER TABLE [dbo].[Prescription] ADD DOCTOR [nvarchar](78) NOT NULL; 
ALTER TABLE [dbo].[Prescription] ADD  DEFAULT (getdate()) FOR [CREATED_ON];
ALTER TABLE [dbo].[Prescription] ADD PRIMARY KEY (ID);
ALTER TABLE [dbo].[Prescription] ADD DIAGNOSIS nvarchar(100) DEFAULT '';
ALTER TABLE [dbo].[Prescription] ADD PATIENT_INSTRUCTION text DEFAULT '';
ALTER TABLE [dbo].[Prescription] ADD DRCODE int NOT NULL DEFAULT 999999999;

CREATE TABLE [dbo].[PrescriptionDetail](
	[ID] [int] IDENTITY(1,1) NOT NULL,
    [PRESCRIPTION_ID] [int] NOT NULL,
	[DOSAGE] [int] NOT NULL,
	[DRUG] [varchar](256) NOT NULL,
    [DRUG_ID] [int] NOT NULL,
    [DURATION] [int] NOT NULL,
    [FREQUENCY] [varchar](256) NOT NULL,
    [FREQUENCY_ID] [int] NOT NULL,
    [ROUTE] [varchar](256) NOT NULL,
    [ROUTE_ID] [int] NOT NULL,
    [INSTRUCTIONS] [nvarchar](1000) NOT NULL
);

ALTER TABLE [dbo].[PrescriptionDetail] ADD PRIMARY KEY (ID);

ALTER TABLE dbo.PrescriptionDetail
ADD FOREIGN KEY (PRESCRIPTION_ID) REFERENCES PRESCRIPTION(ID);

