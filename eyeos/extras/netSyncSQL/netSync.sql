-- phpMyAdmin SQL Dump
-- version 3.3.7deb2build0.10.10.1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Dec 30, 2010 at 09:41 AM
-- Server version: 5.1.49
-- PHP Version: 5.3.3-1ubuntu9.1

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

-- --------------------------------------------------------

--
-- Table structure for table `channels`
--

CREATE TABLE IF NOT EXISTS `channels` (
  `id` bigint(20) unsigned NOT NULL DEFAULT '0',
  `channel` varchar(128) NOT NULL,
  `password` varchar(32) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `netsync_messages`
--

CREATE TABLE IF NOT EXISTS `netsync_messages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `from` varchar(128) NOT NULL,
  `to` varchar(128) NOT NULL,
  `data` varchar(1024) NOT NULL,
  `timestamp` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MEMORY DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `pressence`
--

CREATE TABLE IF NOT EXISTS `pressence` (
  `who` varchar(128) NOT NULL,
  `since` int(10) unsigned NOT NULL,
  `loggedIn` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`who`)
) ENGINE=MEMORY DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `subscriptions`
--

CREATE TABLE IF NOT EXISTS `subscriptions` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `who` varchar(128) NOT NULL,
  `channel` varchar(128) NOT NULL,
  `since` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MEMORY DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;
--
-- Database: `trunk`
--

-- --------------------------------------------------------

--
-- Table structure for table `netsyncHooks`
--

CREATE TABLE IF NOT EXISTS `netsyncHooks` (
  `callback` varchar(256) NOT NULL,
  `file` varchar(256) NOT NULL,
  PRIMARY KEY (`callback`)
) ENGINE=MEMORY DEFAULT CHARSET=latin1;
