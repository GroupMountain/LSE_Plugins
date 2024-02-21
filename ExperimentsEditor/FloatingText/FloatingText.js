import { StaticFloatingText, DynamicFloatingText } from "./plugins/GMLIB-LegacyRemoteCallApi/GMLIB.js";

const configpath = "./plugins/FloatingText/config/config.json";   //配置文件路径
const defaultconfig = JSON.stringify({
    "PlaceholderAPI": true,
    "FloatingTextData": [  //默认配置文件
        {
            "dynamic": false,
            "text": "afagtyargyrwg",
            "pos": {
                "x": 0,
                "y": 200,
                "z": 0,
                "dim": 0
            }
        },
        {
            "dynamic": true,
            "updateTime": 2,
            "text": "boqahdjnhuiqjwbhjiawd",
            "pos": {
                "x": 0,
                "y": 200,
                "z": 3,
                "dim": 0
            }
        }
    ]
});

const config = data.openConfig(configpath, "json", defaultconfig);    //打开配置文件
const papi = config.get("PlaceholderAPI");  // Todo: 对接PAPI

mc.listen("onServerStarted", () => {
    let cmds = mc.newCommand("floatingtext", "§e悬浮字管理       --- §bFloatingText", PermType.Any);
    cmds.setAlias("ft");
    cmds.overload();
    cmds.setCallback((cmd, ori, out, res) => {
        if (ori.player == null) {
            return out.error("该指令只能由玩家对象执行!");
        }
        else {
            if (ori.player.isOP()) {
                main(ori.player);
            }
            else {
                return out.error("该指令只能由管理员执行!");
            }
        }
    });
    cmds.setup();
    let fts = config.get("FloatingTextData");
    fts.forEach((ft) => {
        let pos = new FloatPos(ft.pos.x, ft.pos.y, ft.pos.z, ft.pos.dim);
        if (ft.dynamic == true) {
            new DynamicFloatingText(pos, ft.text, ft.updateTime);
        }
        else {
            new StaticFloatingText(pos, ft.text);
        }
    });
});
function main(pl) {
    let fm = mc.newSimpleForm();
    fm.setTitle("§1§l悬浮字管理");
    fm.setContent("§c请选择");
    fm.addButton("添加悬浮字");
    fm.addButton("移除悬浮字");
    fm.addButton("修改悬浮字");
    //fm.addButton("屏蔽悬浮字");
    pl.sendForm(fm, (pl, id) => {
        switch (id) {
            case 0:
                add(pl);
                break;
            case 1:
                remove(pl);
                break;
            case 2:
                let fm = mc.newCustomForm();
                fm.setTitle("§l§1修改悬浮字");
                fm.addSwitch("动态悬浮字", 1);
                pl.sendForm(fm, (pl, dt) => {
                    if (dt == null) {
                        return;
                    };
                    change(pl, dt[0]);
                });
                break;
        }
    })
}
function add(pl) {
    let fts = config.get("FloatingTextData");
    let fm = mc.newCustomForm();
    let x = pl.pos.x.toFixed(1);
    let y = pl.pos.y.toFixed(1);
    let z = pl.pos.z.toFixed(1);
    let d = pl.pos.dimid.toFixed(0);
    fm.setTitle("§l§1添加悬浮字");
    fm.addSwitch("动态悬浮字", 1)
    fm.addInput("悬浮字文本");
    fm.addInput("动态刷新间隔");
    fm.addInput("x", x, x);
    fm.addInput("y", y, y);
    fm.addInput("z", z, z);
    fm.addInput("DimId", d, d);
    pl.sendForm(fm, (pl, dt) => {
        if (dt == null) {
            return;
        };
        if (dt[0] == 1) {//动态
            fts.push({
                "dynamic": true,
                "updateTime": dt[2],
                "text": dt[1],
                "pos": {
                    "x": dt[3],
                    "y": dt[4],
                    "z": dt[5],
                    "dim": dt[6]
                }
            });
            config.set('FloatingTextData', fts);
            new DynamicFloatingText(pos, dt[1], dt[2]);
        }
        else {//静态
            fts.push({
                "dynamic": false,
                "text": dt[1],
                "pos": {
                    "x": dt[3],
                    "y": dt[4],
                    "z": dt[5],
                    "dim": dt[6]
                }
            });
            config.set('FloatingTextData', fts);
            new StaticFloatingText(pos, dt[1]);
        }
    });
}

function remove(pl) {
    let fm = mc.newSimpleForm();
    let fts = config.get("FloatingTextData");
    fm.setTitle("§1§l移除悬浮字");
    fm.setContent("§c请选择");
    fts.forEach(i => {
        fm.addButton(`${i.text}`);
    });
    pl.sendForm(fm, (pl, id) => {
        if (id == null) {
            return;
        }
        pl.sendModalForm("移除悬浮字", `你确定要移除 ${fts[id].text} 吗？\n\n本操作不可撤销!`, "我确定", "我再想想", (pl, arg) => {
            if (arg == null) {
                return;
            }
            if (arg == 1) {
                let all = StaticFloatingText.getAllFloatingTexts();
                all.forEach(i => {
                    if (i.mText == fts[id].text) {
                        i.destroy();
                    }
                });
                let alls = DynamicFloatingText.getAllFloatingTexts();
                alls.forEach(i => {
                    if (i.mText == fts[id].text) {
                        i.destroy();
                    }
                });
                fts.splice(fts[id], 1);
                config.set('FloatingTextData', fts);
            }
        });

    });
}

function change(pl, id) {
    let fm = mc.newSimpleForm();
    let fts = config.get("FloatingTextData");
    fm.setTitle("§l§1修改悬浮字");
    fm.setContent("§c请选择");
    if (id == 1) {//动态
        var all = DynamicFloatingText.getAllFloatingTexts();
        all.forEach(i => {
            fm.addButton(`${i.mText}`);
        });
    }
    else {//静态
        var all = StaticFloatingText.getAllFloatingTexts();
        all.forEach(i => {
            fm.addButton(`${i.mText}`);
        });
    }
    pl.sendForm(fm, (pl, dt) => {
        if (dt == null) {
            return;
        };
        let fm = mc.newCustomForm();
        let x = all[dt].mPosition.x.toFixed(1);
        let y = all[dt].mPosition.y.toFixed(1);
        let z = all[dt].mPosition.z.toFixed(1);
        let d = all[dt].mPosition.dimid.toFixed(0);
        let text = all[dt].mText;
        fm.setTitle("§l§1添加悬浮字");
        //fm.addSwitch("动态悬浮字", 1)
        fm.addInput("悬浮字文本", all[dt].mText, all[dt].mText);
        fm.addInput("x", x, x);
        fm.addInput("y", y, y);
        fm.addInput("z", z, z);
        fm.addInput("DimId", d, d);
        if (id == 1) {
            fm.addInput("动态刷新间隔");
        }
        pl.sendForm(fm, (pl, dt) => {
            if (dt == null) {
                return;
            };
            if (id == 1) {//动态
                for (let i = 0; i < fts.length; index++) {
                    if (fts[i].text == text) {
                        fts.splice(i, 1);
                        fts.push({
                            "dynamic": true,
                            "updateTime": dt[6],
                            "text": dt[1],
                            "pos": {
                                "x": dt[2],
                                "y": dt[3],
                                "z": dt[4],
                                "dim": dt[5]
                            }
                        });
                    }
                }
            }
            else {
                for (let i = 0; i < fts.length; index++) {
                    if (fts[i].text == all[dt].mText) {
                        fts.splice(i, 1);
                        fts.push({
                            "dynamic": false,
                            "text": dt[1],
                            "pos": {
                                "x": dt[2],
                                "y": dt[3],
                                "z": dt[4],
                                "dim": dt[5]
                            }
                        });
                    }
                }
            }
            config.set('FloatingTextData', fts);
        });
    });
}
