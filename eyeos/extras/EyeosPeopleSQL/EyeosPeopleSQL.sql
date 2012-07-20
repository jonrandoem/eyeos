-- phpMyAdmin SQL Dump
-- version 3.2.2.1deb1
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 26-04-2010 a las 12:42:51
-- Versión del servidor: 5.1.37
-- Versión de PHP: 5.2.10-2ubuntu6.4

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Base de datos: `eyeos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `impressionto`
--

CREATE TABLE IF NOT EXISTS `impressionto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sourceId` varchar(128) NOT NULL,
  `targetId` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sourceId` (`sourceId`),
  KEY `targetId` (`targetId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `peopletag`
--

CREATE TABLE IF NOT EXISTS `peopletag` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `userId` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `relation`
--

CREATE TABLE IF NOT EXISTS `relation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sourceId` varchar(128) NOT NULL,
  `targetId` varchar(128) NOT NULL,
  `state` varchar(50) NOT NULL,
  `lastmodification` int(32) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sourceId` (`sourceId`),
  KEY `targetId` (`targetId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tagperimpressionto`
--

CREATE TABLE IF NOT EXISTS `tagperimpressionto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tagId` int(11) NOT NULL,
  `impressionId` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `tagId` (`tagId`),
  KEY `impressionId` (`impressionId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1;

--
-- Filtros para las tablas descargadas (dump)
--

--
-- Filtros para la tabla `impressionto`
--
ALTER TABLE `impressionto`
  ADD CONSTRAINT `impressionto_ibfk_2` FOREIGN KEY (`targetId`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `impressionto_ibfk_1` FOREIGN KEY (`sourceId`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `peopletag`
--
ALTER TABLE `peopletag`
  ADD CONSTRAINT `peopletag_ibfk_1` FOREIGN KEY (`userId`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `relation`
--
ALTER TABLE `relation`
  ADD CONSTRAINT `relation_ibfk_2` FOREIGN KEY (`targetId`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `relation_ibfk_1` FOREIGN KEY (`sourceId`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `tagperimpressionto`
--
ALTER TABLE `tagperimpressionto`
  ADD CONSTRAINT `tagperimpressionto_ibfk_2` FOREIGN KEY (`impressionId`) REFERENCES `impressionto` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `tagperimpressionto_ibfk_1` FOREIGN KEY (`tagId`) REFERENCES `peopletag` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
