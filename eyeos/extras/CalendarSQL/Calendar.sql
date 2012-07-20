-- phpMyAdmin SQL Dump
-- version 3.1.2deb1ubuntu0.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Jan 18, 2010 at 06:46 PM
-- Server version: 5.0.75
-- PHP Version: 5.2.6-3ubuntu4.5

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `eyeos`
--

-- --------------------------------------------------------

--
-- Table structure for table `calendar`
--

CREATE TABLE IF NOT EXISTS `calendar` (
  `id` varchar(128) NOT NULL,
  `name` varchar(64) NOT NULL,
  `description` text,
  `timezone` tinyint(4) NOT NULL,
  `ownerid` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ownerid` (`ownerid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `calendarevent`
--

CREATE TABLE IF NOT EXISTS `calendarevent` (
  `id` varchar(128) NOT NULL,
  `subject` varchar(128) NOT NULL,
  `location` varchar(128) DEFAULT NULL,
  `description` text,
  `isallday` tinyint(1) NOT NULL,
  `timestart` int(32) NOT NULL,
  `timeend` int(32) NOT NULL,
  `type` varchar(16) NOT NULL,
  `privacy` varchar(10) NOT NULL,
  `repetition` varchar(64) NOT NULL,
  `creatorid` varchar(128) NOT NULL,
  `calendarid` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `creatorid` (`creatorid`),
  KEY `calendarid` (`calendarid`),
  KEY `timestart` (`timestart`),
  KEY `timeend` (`timeend`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `calendarprefs`
--

CREATE TABLE IF NOT EXISTS `calendarprefs` (
  `id` int(20) NOT NULL AUTO_INCREMENT,
  `color` varchar(7) NOT NULL,
  `visible` tinyint(1) NOT NULL,
  `notifications` text NOT NULL,
  `userid` varchar(128) NOT NULL,
  `calendarid` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UNQ_calendarprefs_userid_calendarid` (`userid`,`calendarid`),
  KEY `userid` (`userid`),
  KEY `calendarid` (`calendarid`)
) ENGINE=InnoDB  DEFAULT CHARSET=utf8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `calendarevent`
--
ALTER TABLE `calendarevent`
  ADD CONSTRAINT `calendarevent_ibfk_5` FOREIGN KEY (`calendarid`) REFERENCES `calendar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `calendarevent_ibfk_4` FOREIGN KEY (`creatorid`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `calendarprefs`
--
ALTER TABLE `calendarprefs`
  ADD CONSTRAINT `calendarprefs_ibfk_2` FOREIGN KEY (`calendarid`) REFERENCES `calendar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `calendarprefs_ibfk_3` FOREIGN KEY (`userid`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
