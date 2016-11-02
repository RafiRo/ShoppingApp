package com.man.burning.shoppingapp;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.webkit.WebView;


public class MainActivity extends AppCompatActivity {

    WebView view = null;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web_view);

    String url ="file:///android_asset/MyApp.html";
        view=(WebView) this.findViewById(R.id.webView);
        view.getSettings().setJavaScriptEnabled(true);
        view.loadUrl(url);

    }

    @Override
    public void onBackPressed() {
        view.loadUrl("javascript:CloseAllPopupsForExit()");
        final AlertDialog.Builder ExitApplication = new AlertDialog.Builder(MainActivity.this);
        ExitApplication.setTitle("Exit Application?");
        ExitApplication.setMessage("Are you sure you want to exit ShoppingApp?");
        ExitApplication.setCancelable(true);
        ExitApplication.setPositiveButton("Yes", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                finish();
            }
        });
        ExitApplication.setNegativeButton("No", new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int which) {
                dialog.dismiss();
            }
        });
        ExitApplication.show();
    }
}
