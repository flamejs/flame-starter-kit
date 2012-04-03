var App = Em.Application.create();

App.RootView = Flame.RootView.extend({
    layout: { top: 0, left: 0, right: 0, bottom: 0 },
    childViews: 'splitView'.w(),

    splitView: Flame.HorizontalSplitView.extend({
        leftWidth: 250,
        minLeftWidth: 200,

        leftView: Flame.View.extend({
            childViews: 'titleView buttonView'.w(),

            titleView: Flame.LabelView.extend({
                layout: { left: 5, right: 5, top: 10 },
                textAlign: Flame.ALIGN_CENTER,
                value: 'Flame.js'
            }),

            buttonView: Flame.ButtonView.extend({
                layout: { left: 5, right: 5, top: 40 },
                title: 'Flame!',
                action: function() {
                    Flame.AlertPanel.create({
                        title: 'Hi!',
                        message: 'This is a Flame.AlertPanel',
                        isCancelVisible: false
                    }).popup();
                }
            })
        }),

        rightView: Flame.View.extend({
            childViews: 'labelView'.w(),

            labelView: Flame.LabelView.extend({
                layout: { left: 50, top: 20 },
                value: 'Hello World!'
            })
        })
    })
});

