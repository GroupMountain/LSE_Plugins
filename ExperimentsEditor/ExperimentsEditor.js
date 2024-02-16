//检测前置库 GMLIB-LegacyRemoteCallApi 是否存在
if (ll.hasExported("GMLIB_API", "getAllExperiments")) {
    //导入API
    const GMLIB = {
        setExperimentEnabled: ll.import("GMLib_ModAPI", "setExperimentEnabled"),
        getExperimentEnabled: ll.import("GMLib_ModAPI", "getExperimentEnabled"),
        getAllExperiments: ll.import("GMLIB_API", "getAllExperiments"),
        getExperimentTranslatedName: ll.import("GMLIB_API", "getExperimentTranslatedName")
    };

    function MainForm(pl) {
        let fm = mc.newCustomForm();
        fm.setTitle("实验性玩法");
        fm.addLabel("修改实验性玩法设置");
        let All_Experiments_Ids = GMLIB.getAllExperiments();
        for (let i = 0; i <= All_Experiments_Ids.length - 1; i++) {
            fm.addSwitch(GMLIB.getExperimentTranslatedName(All_Experiments_Ids[i]), GMLIB.getExperimentEnabled(All_Experiments_Ids[i]));
        }
        pl.sendForm(fm, (pl, arg) => {
            if (arg == null) {
                pl.tell("§c表单已关闭");
                return;
            }
            pl.sendModalForm("实验性玩法", "\n你确认要修改实验性玩法？\n\n不建议随意关闭一个已经启用的实验性玩法，这可能引发Addons错误和造成存档损坏。\n\n请谨慎操作。", "确认修改", "我再想想", (pl, res) => {
                if (res == true) {
                    for (let i = 1; i <= All_Experiments_Ids.length; i++) {
                        GMLIB.setExperimentEnabled(All_Experiments_Ids[i - 1], arg[i]);
                    }
                    pl.tell("§a已成功修改实验性玩法！\n请退出并重新连接服务器来保证客户端实验性玩法生效！\n部分实验性内容可能需要重启服务器才能正常生效！");
                }
                else {
                    MainForm(pl);
                }
            });
        });
    };

    mc.listen("onServerStarted", () => {
        let cmd = mc.newCommand("experiments", "编辑实验性玩法", PermType.GameMasters);
        cmd.overload();
        cmd.setCallback((cmd, ori, out, res) => {
            if (ori.player == null) {
                return out.error("该命令只能由玩家执行！");
            }
            else {
                if (ori.player.isOP()) {                       //再次验证，防execute绕过权限组
                    MainForm(ori.player);
                    return;
                }
                else {
                    return out.error("你没有权限使用此命令！");
                }
            }
        });
        cmd.setup();
        logger.info("ExperimentsEditor 已成功加载！");
        logger.info("当前版本： 3.0.0");
        logger.info("插件作者: Tsubasa6848");
    });
}
else {
    logger.error("无法加载！未找到前置库 GMLIB-LegacyRemoteCallApi 或前置库版本过低！");
    logger.error("请安装对应版本的前置库 GMLIB-LegacyRemoteCallApi！");
};