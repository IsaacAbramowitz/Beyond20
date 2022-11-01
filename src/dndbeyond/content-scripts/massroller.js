console.log("Beyond20: Mass Roller module loaded.");

class MassRollerCharacter extends CharacterBase {
    constructor(global_settings) {
        super("item", global_settings);
    }
    getDict() {
        const dict = super.getDict();
        if (this.avatar) {
            dict.avatar = this.avatar;
        }
        return dict;
    }
}

var character = null;
var settings = getDefaultSettings();

function addDisplayTableButton() {
    const icon32 = chrome.runtime.getURL("images/icons/badges/normal32.png");
    const button = E.a({ class: "ct-beyond20-roll button-alt", href: "#" },
        E.span({ class: "label" },
            E.img({ class: "ct-beyond20-item-icon", src: icon32, style: "margin-right: 10px;" }),
            "Display Total Damage on VTT"));
    $("#btnRoll").after(button);

    $(".ct-beyond20-roll").css({
        "float": "right",
        "display": "inline-block"
    });
    $(".ct-beyond20-roll").on('click', (event) => {
        var totalDamageStr = $('#totalDamage').text();

        sendRoll(character, "item", "0", {
            "name": "Total Damage",
            "description": totalDamageStr,
            "item-type": "",
            "tags": ""
        });
    });
}

function documentLoaded(settings) {
    cleanupAlertifyComments();
    character = new MassRollerCharacter(settings);
    if (isRollButtonAdded()) {
        chrome.runtime.sendMessage({ "action": "reload-me" });
    } else {
        addDisplayTableButton();
        const avatar = $(".details-aside .image a");
        if (avatar.length > 0) {
            character.avatar = avatar[0].href;
            const avatarImg = $(".details-aside .image");
            if (avatarImg) {
                addDisplayButton(() => {
                    sendRoll(character, "avatar", character.avatar, { "name": "Item" });
                }, avatarImg, { small: false, image: true });
            }
        }
        const item_name = $(".page-title").text().trim();
        if (settings['subst-dndbeyond'])
            injectDiceToRolls(".item-details .more-info-content, .details-container-equipment .details-container-content-description-text", character, item_name);
    }
}

function updateSettings(new_settings = null) {
    if (new_settings) {
        settings = new_settings;
        if (character)
            character.setGlobalSettings(new_settings);
        key_bindings = getKeyBindings(settings)
    } else {
        getStoredSettings((saved_settings) => {
            documentLoaded(saved_settings);
            updateSettings(saved_settings);
        });
    }
}

function handleMessage(request, sender, sendResponse) {
    if (request.action == "settings") {
        if (request.type == "general")
            updateSettings(request.settings);
    } else if (request.action == "open-options") {
        alertFullSettings();
    }
}

injectCSS(BUTTON_STYLE_CSS);
chrome.runtime.onMessage.addListener(handleMessage);
chrome.runtime.sendMessage({ "action": "activate-icon" });
updateSettings();
