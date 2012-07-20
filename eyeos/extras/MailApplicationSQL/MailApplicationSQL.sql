-- phpMyAdmin SQL Dump
-- version 3.2.4
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 11-01-2010 a las 11:22:22
-- Versión del servidor: 5.1.37
-- Versión de PHP: 5.2.10

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Base de datos: `eyeos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mail_accountto`
--

CREATE TABLE IF NOT EXISTS `mail_accountto` (
  `id` int(10) NOT NULL,
  `userid` varchar(128) NOT NULL,
  `mail` varchar(100) NOT NULL,
  `nameofuser` varchar(100) NOT NULL,
  `description` varchar(100) NOT NULL,
  `typemailbox` varchar(30) NOT NULL,
  `mailboxusername` varchar(100) NOT NULL,
  `mailboxpassword` varchar(100) NOT NULL,
  `mailboxserver` varchar(100) NOT NULL,
  `mailboxport` varchar(6) NOT NULL,
  `mailboxsecure` varchar(5) NOT NULL,
  `typesender` varchar(30) NOT NULL,
  `senderusername` varchar(100) NOT NULL,
  `senderpassword` varchar(100) NOT NULL,
  `senderserver` varchar(100) NOT NULL,
  `senderport` varchar(6) NOT NULL,
  `sendersecure` varchar(5) NOT NULL,
`lastreceived` int(20) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcar la base de datos para la tabla `mail_accountto`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mail_attachment`
--

CREATE TABLE `mail_attachment` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `mailId` int(10) NOT NULL,
  `name` varchar(300) NOT NULL,
  `size` int(7) NOT NULL,
  `type` varchar(30) NOT NULL,
  `path` varchar(300) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Volcar la base de datos para la tabla `mail_attachment`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mail_conversationto`
--

CREATE TABLE IF NOT EXISTS `mail_conversationto` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `accountid` int(10) NOT NULL,
  `lastdate` int(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcar la base de datos para la tabla `mail_conversationto`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mail_folder`
--

CREATE TABLE IF NOT EXISTS `mail_folder` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` varchar(128) NOT NULL,
  `name` varchar(50) NOT NULL,
  `account` int(10) NOT NULL,
  `path` varchar(100) NOT NULL,
  `nocontent` varchar(5) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Volcar la base de datos para la tabla `mail_folder`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mail_folderpermailto`
--

CREATE TABLE IF NOT EXISTS `mail_folderpermailto` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `labelid` varchar(10) NOT NULL,
  `mailid` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Volcar la base de datos para la tabla `mail_folderpermailto`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mail_localtag`
--

CREATE TABLE IF NOT EXISTS `mail_localtag` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `userid` varchar(128) NOT NULL,
  `name` varchar(50) NOT NULL,
  `color` varchar(7) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Volcar la base de datos para la tabla `mail_localtag`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mail_localtagpermailto`
--

CREATE TABLE IF NOT EXISTS `mail_localtagpermailto` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `labelid` varchar(10) NOT NULL,
  `mailid` varchar(10) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Volcar la base de datos para la tabla `mail_localtagpermailto`
--


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `mail_mailto`
--

CREATE TABLE IF NOT EXISTS `mail_mailto` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `messageid` varchar(300) NOT NULL,
  `accountid` int(10) NOT NULL,
  `conversationid` varchar(300) NOT NULL,
  `readed` varchar(6) NOT NULL,
  `fromname` text NOT NULL,
  `toname` text NOT NULL,
  `cc` text NOT NULL,
  `bcc` text NOT NULL,
  `subject` text NOT NULL,
  `header` text NOT NULL,
  `bodyhtml` text NOT NULL,
  `bodytext` text NOT NULL,
  `datetime` int(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Volcar la base de datos para la tabla `mail_mailto`
--

