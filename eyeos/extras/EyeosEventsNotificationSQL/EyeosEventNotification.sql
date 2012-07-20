-- phpMyAdmin SQL Dump
-- version 3.1.2deb1ubuntu0.2
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Dec 18, 2009 at 09:24 PM
-- Server version: 5.0.75
-- PHP Version: 5.2.6-3ubuntu4.4

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `eyeos`
--

-- --------------------------------------------------------

--
-- Table structure for table `eventnotificationinformation`
--

CREATE TABLE IF NOT EXISTS `eventnotificationinformation` (
  `id` bigint(20) NOT NULL auto_increment,
  `type` varchar(128),
  `answer` varchar(128),
  `creationdate` int(32) NOT NULL,
  `sender` varchar(128) NOT NULL,
  `receiver` varchar(128) NOT NULL,
  `question` text NOT NULL,
  `messageinformation` text,
  `availableanswers` text,
  `isquestion` boolean NOT NULL,
  `eventdata` text,
  `hasended` boolean NOT NULL,
   PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `eventnotificationinformation`
--


--
-- Constraints for table `eventnotificationinformation`
--
ALTER TABLE `eventnotificationinformation`
  ADD CONSTRAINT `eventnotificationinformation_ibfk_1` FOREIGN KEY (`sender`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `eventnotificationinformation_ibfk_2` FOREIGN KEY (`receiver`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
