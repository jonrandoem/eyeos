-- phpMyAdmin SQL Dump
-- version 3.1.3.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Mar 23, 2010 at 11:43 AM
-- Server version: 5.1.33
-- PHP Version: 5.2.9-2

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Database: `eyeos`
--

-- --------------------------------------------------------

--
-- Table structure for table `tag`
--

CREATE TABLE IF NOT EXISTS `tag` (
  `tagid` bigint(20) NOT NULL AUTO_INCREMENT,
  `principalid` varchar(128) NOT NULL,
  `label` varchar(64) NOT NULL,
  `color` varchar(7) NOT NULL,
  PRIMARY KEY (`tagid`),
  UNIQUE KEY `UNQ_tag_principalid_label` (`principalid`,`label`),
  KEY `principalid` (`principalid`),
  KEY `label` (`label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Dumping data for table `tag`
--


-- --------------------------------------------------------

--
-- Table structure for table `taggedobject`
--

CREATE TABLE IF NOT EXISTS `taggedobject` (
  `taggableobjectid` varchar(128) NOT NULL,
  `objectdata` text NOT NULL,
  `handlerclassname` varchar(128) NOT NULL,
  PRIMARY KEY (`taggableobjectid`),
  KEY `handlerclassname` (`handlerclassname`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `taggedobject`
--


-- --------------------------------------------------------

--
-- Table structure for table `tagobjectassignation`
--

CREATE TABLE IF NOT EXISTS `tagobjectassignation` (
  `taggableobjectid` varchar(128) NOT NULL,
  `tagid` bigint(20) NOT NULL,
  UNIQUE KEY `UNQ_tagobjectassignation_taggableoibjectid_tagid` (`taggableobjectid`,`tagid`),
  KEY `taggableobjectid` (`taggableobjectid`),
  KEY `tagid` (`tagid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `tagobjectassignation`
--


--
-- Constraints for dumped tables
--

--
-- Constraints for table `tagobjectassignation`
--
ALTER TABLE `tagobjectassignation`
  ADD CONSTRAINT `tagobjectassignation_ibfk_2` FOREIGN KEY (`tagid`) REFERENCES `tag` (`tagid`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tagobjectassignation_ibfk_1` FOREIGN KEY (`taggableobjectid`) REFERENCES `taggedobject` (`taggableobjectid`) ON DELETE CASCADE ON UPDATE CASCADE;
