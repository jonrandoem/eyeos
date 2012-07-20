<?php
/**
 * TODO
 * 
 * @package kernel-libs
 * @subpackage streams
 */
abstract class FileStream {	
	const PARAM_USEINCLUDEPATH = 'useIncludePath';
	const PARAM_CONTEXT = 'context';
	const PARAM_BINARYMODE = 'binaryMode';
	
	protected $fd = null;
	protected $path = null;
	protected $useIncludePath = false;
	protected $context = null;
	protected $binaryMode = true;
	
	private $closed = true;
	
	
	/**
	 * 
	 * @param string $path
	 * @param array $params
	 */
	public function __construct($path, $params = null) {
		$this->path = $path;
		$this->useIncludePath = isset($params[self::PARAM_USEINCLUDEPATH]) ? $params[self::PARAM_USEINCLUDEPATH] : false;
		$this->context = isset($params[self::PARAM_CONTEXT]) ? $params[self::PARAM_CONTEXT] : null;
		$this->binaryMode = isset($params[self::PARAM_BINARYMODE]) ? $params[self::PARAM_BINARYMODE] : true;
	}
	
	public function __destruct() {
		if (!$this->isClosed()) {
			$this->close();
		}
	}
	
	/**
	 * 
	 * @throws EyeIOException
	 */
	public function close() {
		if ($this->fd === null || $this->closed) {
			throw new EyeIOException('This file stream to "' . $this->path . '" is not open or already closed.');
		}
		if (fclose($this->fd) === false) {
			throw new EyeIOException('Unable to close stream to "' . $this->path . '".');
		}
		$this->closed = true;
	}
	
	protected function getFileDescriptor() {
		return $this->fd;
	}
	
	public function getPath() {
		return $this->path;
	}
	
	protected function isClosed() {
		return $this->closed;
	}
	
	/**
	 * TODO
	 * 
	 * @param string $mode The mode specifying the type of access ('r', 'r+', 'w', 'w+', 'a', 'a+')
	 * 
	 * @see fopen()
	 */
	protected function open($mode) {
		$realMode = $mode . ($this->binaryMode ? 'b' : '');
		try {
			if (is_resource($this->context)) {
				$this->fd = fopen($this->path, $realMode, $this->useIncludePath, $this->context);
			} else {
				$this->fd = fopen($this->path, $realMode, $this->useIncludePath);
			}
		} catch (IChainableException $e) {
			throw new EyeIOException('Error while trying to open "' . $this->path . '" with mode "' . $realMode . '"', 0, $e);
		}
		$this->closed = false;
	}
}
?>
