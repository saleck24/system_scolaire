
CREATE DATABASE IF NOT EXISTS school_system;
USE school_system;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(100) NOT NULL,
    role ENUM('admin', 'enseignant') NOT NULL,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password_hash VARCHAR(255),
    niveau VARCHAR(50),
    etablissement VARCHAR(100),
    enseignant_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enseignant_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS performances (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    matiere VARCHAR(100),
    note DECIMAL(10, 2),
    periode VARCHAR(50),
    date_saisie DATETIME,
    synced BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS absences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    date_absence DATE,
    justification TEXT,
    synced BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT,
    type VARCHAR(100),
    gravite ENUM('info', 'warning', 'critical'),
    message TEXT,
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE TABLE IF NOT EXISTS rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    condition_type VARCHAR(100),
    threshold DECIMAL(10, 2),
    action_message TEXT,
    gravite ENUM('info', 'warning', 'critical')
);

CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(100),
    type ENUM('pdf', 'video', 'audio'),
    file_url VARCHAR(255),
    enseignant_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enseignant_id) REFERENCES users(id)
);
