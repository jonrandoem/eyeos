-- phpMyAdmin SQL Dump
-- version 3.2.2.1deb1
-- http://www.phpmyadmin.net
--
-- Servidor: localhost
-- Tiempo de generación: 26-04-2010 a las 12:42:51
-- Versión del servidor: 5.1.37
-- Versión de PHP: 5.2.10-2ubuntu6.4
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `eyeosmetadata`
--

CREATE TABLE IF NOT EXISTS `eyeosmetadata` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `className` varchar(128) NOT NULL,
  `object_id` varchar(128) NOT NULL,
  `name` text NOT NULL,
  `data` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

INSERT INTO `eyeosmetadata` (`id`, `className`, `object_id`, `name`, `data`) VALUES
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.firstname', 's:4:"root";'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.lastname', 's:4:"root";'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.email', 's:16:"root@example.com";'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.applications.installed', 'a:6:{s:10:"calculator";s:1:"0";s:4:"mail";s:1:"0";s:5:"files";s:1:"0";s:8:"calendar";s:1:"0";s:9:"documents";s:1:"0";s:7:"notepad";s:1:"0";}'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.desktop.widgets', 'a:7:{s:7:"desktop";a:4:{s:5:"title";s:7:"Desktop";s:9:"installed";s:5:"false";s:6:"column";s:1:"1";s:8:"position";s:1:"1";}s:5:"files";a:5:{s:5:"title";s:5:"Files";s:9:"installed";s:4:"true";s:6:"column";i:1;s:8:"position";i:0;s:9:"minimized";b:0;}s:6:"groups";a:5:{s:5:"title";s:9:"My Groups";s:9:"installed";s:4:"true";s:6:"column";i:1;s:8:"position";i:1;s:9:"minimized";b:0;}s:6:"events";a:6:{s:5:"title";s:6:"Events";s:9:"installed";s:4:"true";s:5:"items";s:1:"5";s:6:"column";i:3;s:8:"position";i:1;s:9:"minimized";b:0;}s:9:"favorites";a:5:{s:5:"title";s:22:"Favorites Applications";s:9:"installed";s:4:"true";s:6:"column";i:3;s:8:"position";i:0;s:9:"minimized";b:0;}s:5:"notes";a:5:{s:5:"title";s:5:"Notes";s:9:"installed";s:4:"true";s:6:"column";i:3;s:8:"position";i:2;s:9:"minimized";b:0;}i:1;a:3:{s:6:"column";i:1;s:8:"position";i:0;s:9:"minimized";b:0;}}'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.desktop.wallpaperId', 's:6:"nature";'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.language', 's:2:"en";'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.applications.favorite', 'a:5:{s:10:"calculator";s:1:"0";s:5:"files";s:1:"0";s:8:"calendar";s:1:"0";s:9:"documents";s:1:"0";s:7:"notepad";s:1:"0";}'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.desktop.mode', 's:7:"classic";'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.desktop.dashboard.nbcolumns', 's:1:"3";'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.desktop.wallpaperMode', 's:5:"image";'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.desktop.backgroundColors', 'a:9:{s:7:"#E6E6E6";s:4:"true";s:7:"#CCDADA";s:5:"false";s:7:"#A1C4E0";s:5:"false";s:7:"#A7AFC4";s:5:"false";s:7:"#999999";s:5:"false";s:7:"#6293BB";s:5:"false";s:7:"#679966";s:5:"false";s:7:"#787B9A";s:5:"false";s:7:"#6E829A";s:5:"false";}'),
(NULL, 'EyeosUser', 'eyeID_EyeosUser_root', 'eyeos.user.desktop.wallpaper', 's:50:"sys:///extern/images/wallpapers/nature/default.jpg";');
