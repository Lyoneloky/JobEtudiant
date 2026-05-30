Entities:

User
Company
AccountingFirm
Document
Invoice
AccountingEntry
AccountSYSCOHADA
TaxRule
ExportProfile
LearningModel

Relations:

User belongsTo Company
Company owns Documents
Document generates AccountingEntry
AccountingEntry uses AccountSYSCOHADA
LearningModel improves classification