-- phpMyAdmin SQL Dump
-- version 3.1.3.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Mar 03, 2010 at 10:59 AM
-- Server version: 5.1.33
-- PHP Version: 5.2.9-2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `eyeos`
--

-- --------------------------------------------------------

--
-- Table structure for table `eyeosgroup`
--

CREATE TABLE IF NOT EXISTS `eyeosgroup` (
  `id` varchar(128) NOT NULL,
  `name` varchar(40) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `eyeosgroup`
--

INSERT INTO `eyeosgroup` (`id`, `name`, `status`) VALUES
('eyeID_EyeosGroup_admin', 'admin', 0),
('eyeID_EyeosGroup_exec', 'exec', 0),
('eyeID_EyeosGroup_lfs', 'lfs', 0),
('eyeID_EyeosGroup_mnt', 'mnt', 0),
('eyeID_EyeosGroup_rfs', 'rfs', 0),
('eyeID_EyeosGroup_root', 'root', 0),
('eyeID_EyeosGroup_sys', 'sys', 0),
('eyeID_EyeosGroup_um', 'um', 0),
('eyeID_EyeosGroup_users', 'users', 0),
('eyeID_EyeosGroup_vfs', 'vfs', 0),
('eyeID_EyeosGroup_wg', 'wg', 0),
('eyeID_EyeosGroup_wg-managers', 'wg-managers', 0);

-- --------------------------------------------------------

--
-- Table structure for table `eyeosprincipalgroupassignation`
--

CREATE TABLE IF NOT EXISTS `eyeosprincipalgroupassignation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `principalid` varchar(128) NOT NULL,
  `groupid` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `principalid` (`principalid`),
  KEY `groupid` (`groupid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=41 ;

--
-- Dumping data for table `eyeosprincipalgroupassignation`
--

INSERT INTO `eyeosprincipalgroupassignation` (`id`, `principalid`, `groupid`) VALUES
(1, 'eyeID_EyeosUser_root', 'eyeID_EyeosGroup_root'),
(2, 'eyeID_EyeosUser_root', 'eyeID_EyeosGroup_users'),
(3, 'eyeID_EyeosUser_root', 'eyeID_EyeosGroup_sys'),
(4, 'eyeID_EyeosUser_register', 'eyeID_EyeosGroup_sys'),
(5, 'eyeID_EyeosUser_register', 'eyeID_EyeosGroup_um'),
(6, 'eyeID_EyeosGroup_wg-managers', 'eyeID_EyeosGroup_wg');

-- --------------------------------------------------------

--
-- Table structure for table `eyeosuser`
--

CREATE TABLE IF NOT EXISTS `eyeosuser` (
  `id` varchar(128) NOT NULL,
  `name` varchar(40) NOT NULL,
  `password` varchar(40) NOT NULL,
  `primarygroupid` varchar(128) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `primarygroupid` (`primarygroupid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `eyeosuser`
--

INSERT INTO `eyeosuser` (`id`, `name`, `password`, `primarygroupid`, `status`) VALUES
('eyeID_EyeosUser_register', '_register', '', 'eyeID_EyeosGroup_sys', 0),
('eyeID_EyeosUser_root', 'root', 'fff2b4cb565669376cf14c11154c9821b5a8855c', 'eyeID_EyeosGroup_root', 0);

-- --------------------------------------------------------

--
-- Table structure for table `eyeosuserworkgroupassignation`
--

CREATE TABLE IF NOT EXISTS `eyeosuserworkgroupassignation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `userid` varchar(128) NOT NULL,
  `workgroupid` varchar(128) NOT NULL,
  `role` tinyint(4) NOT NULL,
  `status` tinyint(4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK_userid_workgroupid` (`userid`,`workgroupid`),
  KEY `userid` (`userid`),
  KEY `workgroupid` (`workgroupid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `eyeosuserworkgroupassignation`
--


-- --------------------------------------------------------

--
-- Table structure for table `eyeosworkgroup`
--

CREATE TABLE IF NOT EXISTS `eyeosworkgroup` (
  `id` varchar(128) NOT NULL,
  `name` varchar(40) NOT NULL,
  `ownerId` varchar(128) NOT NULL,
  `mastergroupid` varchar(128) NOT NULL,
  `privacymode` tinyint(4) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `ownerId` (`ownerId`),
  KEY `mastergroupid` (`mastergroupid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `eyeosworkgroup`
--


--
-- Constraints for dumped tables
--

--
-- Constraints for table `eyeosprincipalgroupassignation`
--
ALTER TABLE `eyeosprincipalgroupassignation`
  ADD CONSTRAINT `FK_eyeosprincipal2groupassignation_group_id` FOREIGN KEY (`groupid`) REFERENCES `eyeosgroup` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `eyeosuser`
--
ALTER TABLE `eyeosuser`
  ADD CONSTRAINT `FK_eyeosuser_primaryGroup_id` FOREIGN KEY (`primarygroupid`) REFERENCES `eyeosgroup` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `eyeosuserworkgroupassignation`
--
ALTER TABLE `eyeosuserworkgroupassignation`
  ADD CONSTRAINT `eyeosuserworkgroupassignation_ibfk_2` FOREIGN KEY (`workgroupid`) REFERENCES `eyeosworkgroup` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `eyeosuserworkgroupassignation_ibfk_3` FOREIGN KEY (`userid`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `eyeosworkgroup`
--
ALTER TABLE `eyeosworkgroup`
  ADD CONSTRAINT `eyeosworkgroup_ibfk_3` FOREIGN KEY (`ownerId`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `eyeosworkgroup_ibfk_4` FOREIGN KEY (`mastergroupid`) REFERENCES `eyeosgroup` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
