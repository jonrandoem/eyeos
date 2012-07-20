-- phpMyAdmin SQL Dump
-- version 3.2.2.1deb1
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 13-04-2010 a las 13:41:04
-- Versión del servidor: 5.1.37
-- Versión de PHP: 5.2.10-2ubuntu6.4

SET SQL_MODE="NO_AUTO_VALUE_ON_ZERO";

--
-- Base de datos: `eyeos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `languageadmin`
--

CREATE TABLE IF NOT EXISTS `languageadminto` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `language` varchar(50) NOT NULL,
  `code` varchar(10) NOT NULL,
  `assigned` varchar(128) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `assigned` (`assigned`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 AUTO_INCREMENT=1 ;

--
-- Filtros para las tablas descargadas (dump)
--

--
-- Filtros para la tabla `languageadmin`
--
ALTER TABLE `languageadminto`
  ADD CONSTRAINT `languageadminto_ibfk_1` FOREIGN KEY (`assigned`) REFERENCES `eyeosuser` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;