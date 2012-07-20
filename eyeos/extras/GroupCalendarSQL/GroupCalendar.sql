-- phpMyAdmin SQL Dump
-- version 3.2.4
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: May 10, 2011 at 12:06 PM
-- Server version: 5.1.41
-- PHP Version: 5.3.1

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";
--
-- Table structure for table `eventgroup`
--

DROP TABLE IF EXISTS `eventgroup`;
CREATE TABLE IF NOT EXISTS `eventgroup` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `eventsubject` varchar(128) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;



--
-- Table structure for table `eventineventgroup`
--

DROP TABLE IF EXISTS `eventineventgroup`;
CREATE TABLE IF NOT EXISTS `eventineventgroup` (
  `eventId` varchar(128) NOT NULL,
  `eventgroupid` int(11) NOT NULL,
  KEY `eventineventgroup_ibfk_4` (`eventId`),
  KEY `eventineventgroup_ibfk_5` (`eventgroupid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



--
-- Constraints for table `eventineventgroup`
--
ALTER TABLE `eventineventgroup`
  ADD CONSTRAINT `eventineventgroup_ibfk_4` FOREIGN KEY (`eventId`) REFERENCES `calendarevent` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `eventineventgroup_ibfk_5` FOREIGN KEY (`eventgroupid`) REFERENCES `eventgroup` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
  
 

--
-- Table structure for table `calendarevent`
--

DROP TABLE IF EXISTS `calendarevent`;
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
  `repeattype` varchar(1) DEFAULT NULL,
  `finaltype` tinyint(4) DEFAULT NULL,
  `finalvalue` int(32) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `creatorid` (`creatorid`),
  KEY `calendarid` (`calendarid`),
  KEY `timestart` (`timestart`),
  KEY `timeend` (`timeend`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;



--
-- Constraints for dumped tables
--

--
-- Constraints for table `calendarevent`
--
ALTER TABLE `calendarevent`
  ADD CONSTRAINT `calendarevent_ibfk_4` FOREIGN KEY (`creatorid`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `calendarevent_ibfk_5` FOREIGN KEY (`calendarid`) REFERENCES `calendar` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

SET FOREIGN_KEY_CHECKS=1;
