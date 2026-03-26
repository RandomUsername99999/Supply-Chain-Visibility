-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 26, 2026 at 05:51 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `traking`
--

-- --------------------------------------------------------

--
-- Table structure for table `api_driverprofile`
--

CREATE TABLE `api_driverprofile` (
  `id` bigint(20) NOT NULL,
  `license_number` varchar(50) NOT NULL,
  `license_expiry_date` date NOT NULL,
  `address` longtext NOT NULL,
  `phone` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `customer_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL COMMENT 'Optional user account for customers',
  `business_name` varchar(150) DEFAULT NULL,
  `contact_person_name` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `phone_number` varchar(20) NOT NULL,
  `alternate_phone` varchar(20) DEFAULT NULL,
  `address` text NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `tax_id` varchar(50) DEFAULT NULL,
  `credit_limit` decimal(15,2) DEFAULT NULL,
  `payment_terms` int(11) DEFAULT NULL COMMENT 'Payment terms in days',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Customer and retailer information';

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`customer_id`, `user_id`, `business_name`, `contact_person_name`, `email`, `phone_number`, `alternate_phone`, `address`, `latitude`, `longitude`, `tax_id`, `credit_limit`, `payment_terms`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 6, 'Acme Corporation', 'Wile E. Coyote', 'contact@acmecorp.com', '+18009990001', NULL, 'Desert Valley Road, TX', 31.96860000, -99.90180000, NULL, 50000.00, 30, 1, '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(2, NULL, 'Globex Inc', 'Hank Scorpio', 'hank@globex.com', '+18009990002', NULL, 'Cyprus Creek, OR', 44.92800000, -123.02320000, NULL, 100000.00, 45, 1, '2026-03-25 15:59:11', '2026-03-25 15:59:11');

-- --------------------------------------------------------

--
-- Table structure for table `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `drivers`
--

CREATE TABLE `drivers` (
  `driver_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL COMMENT 'Reference to employee record',
  `license_number` varchar(50) NOT NULL,
  `license_expiry_date` date NOT NULL,
  `license_type` enum('light_vehicle','heavy_vehicle','motorcycle','trailer') NOT NULL,
  `experience_years` decimal(4,1) NOT NULL DEFAULT 0.0,
  `medical_certificate_expiry` date DEFAULT NULL,
  `last_training_date` date DEFAULT NULL,
  `status` enum('available','on_route','off_duty','suspended','inactive') DEFAULT 'available',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Driver-specific information and credentials';

--
-- Dumping data for table `drivers`
--

INSERT INTO `drivers` (`driver_id`, `employee_id`, `license_number`, `license_expiry_date`, `license_type`, `experience_years`, `medical_certificate_expiry`, `last_training_date`, `status`, `created_at`, `updated_at`) VALUES
(1, 4, 'DL-NY-847293', '2028-11-30', 'heavy_vehicle', 5.5, NULL, NULL, 'available', '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(2, 5, 'DL-NY-394821', '2027-04-15', 'light_vehicle', 3.0, NULL, NULL, 'on_route', '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(3, 7, '789876555', '2026-05-22', 'heavy_vehicle', 5.0, NULL, NULL, 'available', '2026-03-26 01:20:25', '2026-03-26 01:20:25');

-- --------------------------------------------------------

--
-- Table structure for table `driver_vehicle_assignments`
--

CREATE TABLE `driver_vehicle_assignments` (
  `assignment_id` int(11) NOT NULL,
  `driver_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL,
  `assignment_start_date` datetime NOT NULL,
  `assignment_end_date` datetime DEFAULT NULL,
  `status` enum('active','completed','cancelled','expired') DEFAULT 'active',
  `assigned_by` int(11) NOT NULL COMMENT 'User ID who created assignment',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `driver_vehicle_assignments`
--

INSERT INTO `driver_vehicle_assignments` (`assignment_id`, `driver_id`, `vehicle_id`, `assignment_start_date`, `assignment_end_date`, `status`, `assigned_by`, `notes`, `created_at`, `updated_at`) VALUES
(1, 2, 1, '2026-03-01 08:00:00', NULL, 'active', 3, NULL, '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(2, 1, 2, '2026-03-10 09:00:00', '2026-03-20 17:00:00', 'completed', 3, NULL, '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(3, 1, 2, '2026-03-26 01:40:01', NULL, 'active', 1, NULL, '2026-03-26 01:40:01', '2026-03-26 01:40:01');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `employee_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL COMMENT 'Reference to user account',
  `full_name` varchar(100) NOT NULL,
  `national_id` varchar(50) NOT NULL COMMENT 'NIC / National ID',
  `contact_number` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `date_of_birth` date NOT NULL,
  `hire_date` date NOT NULL,
  `termination_date` date DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`employee_id`, `user_id`, `full_name`, `national_id`, `contact_number`, `address`, `date_of_birth`, `hire_date`, `termination_date`, `status`, `emergency_contact_name`, `emergency_contact_number`, `created_at`, `updated_at`) VALUES
(1, 1, 'System Administrator', 'ID-000000', '+18005550001', '100 Tech Blvd, NY', '1985-01-01', '2020-01-01', NULL, 'active', NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(2, 2, 'John Doe', 'ID-100200', '+18005550002', '200 Business Rd, NY', '1982-05-14', '2020-03-15', NULL, 'active', NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(3, 3, 'Sarah Connor', 'ID-100300', '+18005550003', '300 Supply Ave, NY', '1990-08-22', '2021-06-10', NULL, 'active', NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(4, 4, 'Mike Wheeler', 'ID-100400', '+18005550004', '400 Transit St, NY', '1993-11-30', '2022-01-20', NULL, 'active', NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(5, 5, 'Alex Vance', 'ID-100500', '+18005550005', '500 Highway Ln, NY', '1988-02-18', '2022-04-05', NULL, 'active', NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(7, 7, 'kamal', '2345642', '09097', 'hgjgj', '2000-02-26', '2026-03-26', NULL, 'active', NULL, NULL, '2026-03-26 01:20:25', '2026-03-26 01:20:25');

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `role_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='Stores system user roles (Admin, Manager, Dispatcher, Driver, Customer)';

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`role_id`, `role_name`, `role_description`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'Full system access and management', '2026-03-25 15:39:31', '2026-03-25 15:39:31'),
(2, 'Manager', 'Oversees operations and staff', '2026-03-25 15:39:31', '2026-03-25 15:39:31'),
(3, 'Dispatcher', 'Manages shipments and vehicle assignments', '2026-03-25 15:39:31', '2026-03-25 15:39:31'),
(4, 'Driver', 'Executes deliveries', '2026-03-25 15:39:31', '2026-03-25 15:39:31'),
(5, 'Customer', 'Receives shipments and manages orders', '2026-03-25 15:39:31', '2026-03-25 15:39:31');

-- --------------------------------------------------------

--
-- Table structure for table `shipments`
--

CREATE TABLE `shipments` (
  `shipment_id` int(11) NOT NULL,
  `shipment_reference` varchar(50) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `source_location_name` varchar(200) NOT NULL,
  `source_address` text NOT NULL,
  `source_latitude` decimal(10,8) DEFAULT NULL,
  `source_longitude` decimal(11,8) DEFAULT NULL,
  `destination_address` text NOT NULL,
  `destination_latitude` decimal(10,8) DEFAULT NULL,
  `destination_longitude` decimal(11,8) DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL COMMENT 'Assigned driver',
  `vehicle_id` int(11) DEFAULT NULL COMMENT 'Assigned vehicle',
  `assignment_id` int(11) DEFAULT NULL COMMENT 'Reference to driver-vehicle assignment',
  `status` enum('pending','assigned','picked_up','in_transit','delivered','failed','cancelled','returned') DEFAULT 'pending',
  `priority` enum('low','normal','high','urgent') DEFAULT 'normal',
  `scheduled_pickup_date` datetime DEFAULT NULL,
  `scheduled_delivery_date` datetime DEFAULT NULL,
  `actual_pickup_date` datetime DEFAULT NULL,
  `actual_delivery_date` datetime DEFAULT NULL,
  `weight_kg` decimal(10,2) DEFAULT NULL,
  `volume_m3` decimal(10,2) DEFAULT NULL,
  `total_cost` decimal(15,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `shipments`
--

INSERT INTO `shipments` (`shipment_id`, `shipment_reference`, `customer_id`, `source_location_name`, `source_address`, `source_latitude`, `source_longitude`, `destination_address`, `destination_latitude`, `destination_longitude`, `driver_id`, `vehicle_id`, `assignment_id`, `status`, `priority`, `scheduled_pickup_date`, `scheduled_delivery_date`, `actual_pickup_date`, `actual_delivery_date`, `weight_kg`, `volume_m3`, `total_cost`, `notes`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'SHP-10001', 1, 'Central Warehouse', '100 Warehouse Row, NY', 40.71280000, -74.00600000, 'Desert Valley Road, TX', 31.96860000, -99.90180000, 2, 1, 1, 'in_transit', 'high', '2026-03-24 10:00:00', '2026-03-27 15:00:00', NULL, NULL, 4500.00, 12.50, NULL, NULL, 2, '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(2, 'SHP-10002', 2, 'Port Authority', 'Terminal 4, NJ', 40.68950000, -74.17450000, 'Cyprus Creek, OR', 44.92800000, -123.02320000, NULL, NULL, NULL, 'pending', 'normal', '2026-03-28 08:00:00', '2026-04-02 12:00:00', NULL, NULL, 12000.00, 25.00, NULL, NULL, 2, '2026-03-25 15:59:11', '2026-03-25 15:59:11');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL COMMENT 'Stored using bcrypt or Argon2',
  `role_id` int(11) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `last_login` timestamp NULL DEFAULT NULL,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci COMMENT='System users with authentication credentials';

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `email`, `password_hash`, `role_id`, `is_active`, `last_login`, `password_changed_at`, `created_at`, `updated_at`) VALUES
(1, 'superadmin', 'admin@logistics.com', 'pbkdf2_sha256$1000000$LI31XmejEHJiXpO9uNWupt$y/YtGrwTlJI2FuMRuPTGl3B2IWkKRuTaT34iJCogac8=', 1, 1, NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 16:26:39'),
(2, 'manager_john', 'john@logistics.com', 'pbkdf2_sha256$1000000$LI31XmejEHJiXpO9uNWupt$y/YtGrwTlJI2FuMRuPTGl3B2IWkKRuTaT34iJCogac8=', 2, 1, NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 16:26:39'),
(3, 'dispatch_sarah', 'sarah@logistics.com', 'pbkdf2_sha256$1000000$LI31XmejEHJiXpO9uNWupt$y/YtGrwTlJI2FuMRuPTGl3B2IWkKRuTaT34iJCogac8=', 3, 1, NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 16:26:39'),
(4, 'driver_mike', 'mike@logistics.com', 'pbkdf2_sha256$1000000$LI31XmejEHJiXpO9uNWupt$y/YtGrwTlJI2FuMRuPTGl3B2IWkKRuTaT34iJCogac8=', 4, 1, NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 16:26:39'),
(5, 'driver_alex', 'alex@logistics.com', 'pbkdf2_sha256$1000000$LI31XmejEHJiXpO9uNWupt$y/YtGrwTlJI2FuMRuPTGl3B2IWkKRuTaT34iJCogac8=', 4, 1, NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 16:26:39'),
(6, 'cust_acme', 'contact@acmecorp.com', 'pbkdf2_sha256$1000000$LI31XmejEHJiXpO9uNWupt$y/YtGrwTlJI2FuMRuPTGl3B2IWkKRuTaT34iJCogac8=', 5, 1, NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 16:26:39'),
(7, 'driver', 'driver@gmail.com', 'pbkdf2_sha256$1000000$lvihQFxtFyw49oe3QoiVtU$LjAulx+yRUzTZw+woD4BmmXDj+SYItdXWH8GShU59/s=', 4, 1, NULL, NULL, '2026-03-26 01:20:25', '2026-03-26 01:20:25');

-- --------------------------------------------------------

--
-- Table structure for table `vehicles`
--

CREATE TABLE `vehicles` (
  `vehicle_id` int(11) NOT NULL,
  `plate_number` varchar(20) NOT NULL,
  `vehicle_type` enum('truck','van','trailer','pickup','motorcycle') NOT NULL,
  `manufacturer` varchar(50) DEFAULT NULL,
  `model` varchar(50) DEFAULT NULL,
  `year` int(11) DEFAULT NULL,
  `capacity_kg` decimal(10,2) DEFAULT NULL COMMENT 'Weight capacity in kilograms',
  `capacity_volume` decimal(10,2) DEFAULT NULL COMMENT 'Volume capacity in cubic meters',
  `is_refrigerated` tinyint(1) DEFAULT 0,
  `fuel_type` enum('petrol','diesel','electric','hybrid','cng') NOT NULL,
  `status` enum('available','in_use','maintenance','out_of_service','reserved') DEFAULT 'available',
  `insurance_expiry` date DEFAULT NULL,
  `registration_expiry` date DEFAULT NULL,
  `last_maintenance_date` date DEFAULT NULL,
  `next_maintenance_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

--
-- Dumping data for table `vehicles`
--

INSERT INTO `vehicles` (`vehicle_id`, `plate_number`, `vehicle_type`, `manufacturer`, `model`, `year`, `capacity_kg`, `capacity_volume`, `is_refrigerated`, `fuel_type`, `status`, `insurance_expiry`, `registration_expiry`, `last_maintenance_date`, `next_maintenance_date`, `created_at`, `updated_at`) VALUES
(1, 'TRK-9821', 'truck', 'Volvo', 'FH16', 2021, 18000.00, 40.00, 0, 'diesel', 'in_use', '2026-12-31', '2026-12-31', NULL, NULL, '2026-03-25 15:59:11', '2026-03-25 15:59:11'),
(2, 'VAN-4432', 'van', 'Mercedes', 'Sprinter', 2022, 3500.00, 14.00, 0, 'diesel', 'in_use', '2026-10-15', '2026-10-15', NULL, NULL, '2026-03-25 15:59:11', '2026-03-26 01:40:01'),
(4, 'TEST999', 'truck', NULL, NULL, 2026, 78.00, 98.00, 0, 'diesel', NULL, NULL, NULL, NULL, NULL, '2026-03-26 00:34:27', '2026-03-26 00:34:27'),
(5, 'CAA - 9876', 'truck', 'Honda', 'Volvo  FH16', 2024, 50.00, 40.00, 0, 'diesel', NULL, '2026-10-15', '2026-07-15', NULL, NULL, '2026-03-26 00:36:23', '2026-03-26 00:36:23'),
(6, 'aaa - 456', 'truck', 'sman', 'sman', 2024, 90.00, 79.00, 1, 'diesel', NULL, '2026-03-31', '2026-03-31', NULL, NULL, '2026-03-26 00:59:19', '2026-03-26 00:59:19');

-- --------------------------------------------------------

--
-- Table structure for table `vehicle_assignment_history`
--

CREATE TABLE `vehicle_assignment_history` (
  `id` bigint(20) NOT NULL,
  `start_date` datetime(6) NOT NULL,
  `end_date` datetime(6) DEFAULT NULL,
  `status` varchar(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `vehicle_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `vehicle_assignment_history`
--

INSERT INTO `vehicle_assignment_history` (`id`, `start_date`, `end_date`, `status`, `user_id`, `vehicle_id`) VALUES
(1, '2026-03-26 00:37:24.367712', NULL, 'Active', 4, 2),
(2, '2026-03-26 01:21:22.307780', '2026-03-26 01:24:33.557550', 'Completed', 5, 5),
(3, '2026-03-26 01:24:33.566470', NULL, 'Active', 5, 4);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `api_driverprofile`
--
ALTER TABLE `api_driverprofile`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`customer_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_phone` (`phone_number`),
  ADD KEY `idx_location` (`latitude`,`longitude`);

--
-- Indexes for table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indexes for table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `drivers`
--
ALTER TABLE `drivers`
  ADD PRIMARY KEY (`driver_id`),
  ADD UNIQUE KEY `employee_id` (`employee_id`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD KEY `idx_license_number` (`license_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_license_expiry` (`license_expiry_date`);

--
-- Indexes for table `driver_vehicle_assignments`
--
ALTER TABLE `driver_vehicle_assignments`
  ADD PRIMARY KEY (`assignment_id`),
  ADD UNIQUE KEY `unique_vehicle_assignment` (`vehicle_id`,`assignment_start_date`),
  ADD KEY `assigned_by` (`assigned_by`),
  ADD KEY `idx_driver` (`driver_id`),
  ADD KEY `idx_vehicle` (`vehicle_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_date_range` (`assignment_start_date`,`assignment_end_date`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`employee_id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD KEY `idx_national_id` (`national_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_hire_date` (`hire_date`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `shipments`
--
ALTER TABLE `shipments`
  ADD PRIMARY KEY (`shipment_id`),
  ADD UNIQUE KEY `shipment_reference` (`shipment_reference`),
  ADD KEY `vehicle_id` (`vehicle_id`),
  ADD KEY `assignment_id` (`assignment_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_reference` (`shipment_reference`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_driver` (`driver_id`),
  ADD KEY `idx_scheduled_dates` (`scheduled_pickup_date`,`scheduled_delivery_date`),
  ADD KEY `idx_customer` (`customer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_username` (`username`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_role` (`role_id`);

--
-- Indexes for table `vehicles`
--
ALTER TABLE `vehicles`
  ADD PRIMARY KEY (`vehicle_id`),
  ADD UNIQUE KEY `plate_number` (`plate_number`),
  ADD KEY `idx_plate_number` (`plate_number`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_vehicle_type` (`vehicle_type`);

--
-- Indexes for table `vehicle_assignment_history`
--
ALTER TABLE `vehicle_assignment_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vehicle_assignment_user_id_fk_users_user_id` (`user_id`),
  ADD KEY `vehicle_assignment_vehicle_id_fk_vehicles_vehicle_id` (`vehicle_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `api_driverprofile`
--
ALTER TABLE `api_driverprofile`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `customer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `drivers`
--
ALTER TABLE `drivers`
  MODIFY `driver_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `driver_vehicle_assignments`
--
ALTER TABLE `driver_vehicle_assignments`
  MODIFY `assignment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `employee_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `shipments`
--
ALTER TABLE `shipments`
  MODIFY `shipment_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `vehicles`
--
ALTER TABLE `vehicles`
  MODIFY `vehicle_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vehicle_assignment_history`
--
ALTER TABLE `vehicle_assignment_history`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `api_driverprofile`
--
ALTER TABLE `api_driverprofile`
  ADD CONSTRAINT `api_driverprofile_user_id_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `customers`
--
ALTER TABLE `customers`
  ADD CONSTRAINT `customers_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL;

--
-- Constraints for table `drivers`
--
ALTER TABLE `drivers`
  ADD CONSTRAINT `drivers_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`);

--
-- Constraints for table `driver_vehicle_assignments`
--
ALTER TABLE `driver_vehicle_assignments`
  ADD CONSTRAINT `driver_vehicle_assignments_ibfk_1` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`),
  ADD CONSTRAINT `driver_vehicle_assignments_ibfk_2` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`),
  ADD CONSTRAINT `driver_vehicle_assignments_ibfk_3` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `shipments`
--
ALTER TABLE `shipments`
  ADD CONSTRAINT `shipments_ibfk_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`customer_id`),
  ADD CONSTRAINT `shipments_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `drivers` (`driver_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `shipments_ibfk_3` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `shipments_ibfk_4` FOREIGN KEY (`assignment_id`) REFERENCES `driver_vehicle_assignments` (`assignment_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `shipments_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`role_id`);

--
-- Constraints for table `vehicle_assignment_history`
--
ALTER TABLE `vehicle_assignment_history`
  ADD CONSTRAINT `vehicle_assignment_user_id_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `vehicle_assignment_vehicle_id_fk_vehicles_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`vehicle_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
