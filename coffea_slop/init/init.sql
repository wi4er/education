CREATE EXTENSION "uuid-ossp";

-- Admin group
INSERT INTO personal_group (id, "createdAt", "updatedAt")
VALUES ('admin', NOW(), NOW());

-- Admin user (password: qwerty)
INSERT INTO personal_user (id, login, password, email, "createdAt", "updatedAt")
VALUES ('admin', 'admin', '$2b$10$ghFQGWYx4eWrWzcMOxM8ZeCxejSjnj4ByoXPjMIGpPe7lcPRcBsB6', 'admin@coffea.local', NOW(), NOW());

-- Link admin user to admin group
INSERT INTO personal_user4group ("userId", "groupId")
VALUES ('admin', 'admin');

-- Grant admin group full access to all entities
INSERT INTO personal_access ("groupId", entity, method)
VALUES
  ('admin', 'ATTRIBUTE', 'GET'),
  ('admin', 'ATTRIBUTE', 'POST'),
  ('admin', 'ATTRIBUTE', 'PUT'),
  ('admin', 'ATTRIBUTE', 'DELETE'),
  ('admin', 'LANGUAGE', 'GET'),
  ('admin', 'LANGUAGE', 'POST'),
  ('admin', 'LANGUAGE', 'PUT'),
  ('admin', 'LANGUAGE', 'DELETE'),
  ('admin', 'STATUS', 'GET'),
  ('admin', 'STATUS', 'POST'),
  ('admin', 'STATUS', 'PUT'),
  ('admin', 'STATUS', 'DELETE'),
  ('admin', 'DIRECTORY', 'GET'),
  ('admin', 'DIRECTORY', 'POST'),
  ('admin', 'DIRECTORY', 'PUT'),
  ('admin', 'DIRECTORY', 'DELETE'),
  ('admin', 'MEASURE', 'GET'),
  ('admin', 'MEASURE', 'POST'),
  ('admin', 'MEASURE', 'PUT'),
  ('admin', 'MEASURE', 'DELETE'),
  ('admin', 'POINT', 'GET'),
  ('admin', 'POINT', 'POST'),
  ('admin', 'POINT', 'PUT'),
  ('admin', 'POINT', 'DELETE'),
  ('admin', 'USER', 'GET'),
  ('admin', 'USER', 'POST'),
  ('admin', 'USER', 'PUT'),
  ('admin', 'USER', 'DELETE'),
  ('admin', 'GROUP', 'GET'),
  ('admin', 'GROUP', 'POST'),
  ('admin', 'GROUP', 'PUT'),
  ('admin', 'GROUP', 'DELETE'),
  ('admin', 'ACCESS', 'GET'),
  ('admin', 'ACCESS', 'POST'),
  ('admin', 'ACCESS', 'PUT'),
  ('admin', 'ACCESS', 'DELETE'),
  ('admin', 'BLOCK', 'GET'),
  ('admin', 'BLOCK', 'POST'),
  ('admin', 'BLOCK', 'PUT'),
  ('admin', 'BLOCK', 'DELETE'),
  ('admin', 'ELEMENT', 'GET'),
  ('admin', 'ELEMENT', 'POST'),
  ('admin', 'ELEMENT', 'PUT'),
  ('admin', 'ELEMENT', 'DELETE'),
  ('admin', 'SECTION', 'GET'),
  ('admin', 'SECTION', 'POST'),
  ('admin', 'SECTION', 'PUT'),
  ('admin', 'SECTION', 'DELETE'),
  ('admin', 'FORM', 'GET'),
  ('admin', 'FORM', 'POST'),
  ('admin', 'FORM', 'PUT'),
  ('admin', 'FORM', 'DELETE'),
  ('admin', 'RESULT', 'GET'),
  ('admin', 'RESULT', 'POST'),
  ('admin', 'RESULT', 'PUT'),
  ('admin', 'RESULT', 'DELETE');