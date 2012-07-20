function netsync_application(checknum, pid, args) {
    //new eyeos.application.NetSync(checknum, pid);
    var netSync = eyeos.netSync.NetSync.getInstance();
    netSync.init(checknum);
    netSync.subscribe('pressence');
    netSync.subscribe('@userchannel');
    netSync.listen();
}
