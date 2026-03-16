using { easybill } from '../db/schema';

// Servicio admin — lectura directa de entidades para debug/seed verification
service AdminService @(requires: 'admin') {
  entity Companies as projection on easybill.Companies;
  entity Clients   as projection on easybill.Clients;
  entity Products  as projection on easybill.Products;
  entity AuditLog  as projection on easybill.AuditLog;
}
