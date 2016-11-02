/**
 * Created by dorsh on 4/30/2016.
 */

var app = angular.module('ItemsTableApp',[]);

app.controller('MainController',['$scope','$http', function($scope, $http) {
    var ID = null;
    var userName = null;
    $scope.balance = "0";
    $scope.ItemName = "Select";

    // initialization of scopes when creating the page
    google.charts.load('current', {packages: ['corechart']});
    google.charts.setOnLoadCallback(drawChart);
    $scope.AddItemPage = false;
    $scope.connected = false;
    $scope.ChartPage = false;
    $scope.LoginPage = true;
    $scope.itemsTable = [];

    // Login and retrieve data from server when connected
    $scope.CheckCredentials = function () {
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;';
        var data = $.param({email : $scope.enterEmail , password : $scope.Password});
        $http.post("http://papael.com/ShoppingApp/verify.php",data).then(function (response) {
            if (response.data.records.length <= 0) {
                $("#InvalidEmailOrPassword").popup("open");
            } else {
                ID = response.data.records[0].id;
                userName = response.data.records[0].username;
                $scope.userName = userName;
                $scope.connected = true;
                $scope.LoginPage = false;
                var idDetails = $.param({id: ID});
                $http.post("http://papael.com/ShoppingApp/getBalance.php", idDetails).then(function (response) {
                    if (response.data.records && response.data.records.length > 0)
                    {
                            $scope.balance = response.data.records[0].balance;
                        $http.post("http://papael.com/ShoppingApp/getData.php", idDetails).then(function (response) {
                            if (response.data.records && response.data.records.length > 0)
                            {
                                if (response.data.records.length > 0) {
                                    $scope.itemsTable = response.data.records;
                                }
                                $scope.remaining = response.data.records[0].remaining;

                                if ($scope.remaining < 0) {
                                    $("#ExceedingBalancePopup").popup("open");
                                }
                            }
                            else {
                                $scope.remaining = $scope.balance;
                            }
                        }, function error(response) {
                            window.alert("Issue retrieving data from Server!");
                        });
                    }
                }, function error(response) {
                        window.alert("Issue getting your account Balance!");
                    });

            }
        }, function error(response) {
            $("#InvalidEmailOrPassword").popup("open");
        });
    };

    // Set the Balance at both Server side and client side
    $scope.setBalance = function() {
        var Balance = $scope.balanceNumber;
        var BalanceData = $.param({id : ID , balance : Balance});
        $http.post("http://papael.com/ShoppingApp/setBalance.php",BalanceData).then(function(response) {
            $scope.balance = Balance;
            var getRemainingBudget = $.param({id: ID});
            $http.post("http://papael.com/ShoppingApp/getRemaining.php", getRemainingBudget).then(function (response) {
                    if (response.data.records && response.data.records.length > 0) {
                        $scope.remaining = response.data.records[0].remaining;
                    }
                    else {
                        $scope.remaining = $scope.balance;
                    }
                }, function ErrorGettingRemainingBudget(response) {
                        alert( "Something gone wrong" );
                });
        }, function Error(response) {
            alert( "Something gone wrong" );
        });
    $("#SetAccoutBalancePopup").popup("close");
    };

    // Remove one item from the list
    $scope.RemoveItem = function(dataID)
    {
        var ClearItem = $.param({ id : ID ,item : dataID });
        $http.post("http://papael.com/ShoppingApp/clearItem.php",ClearItem).then(function(response) {
            var index = -1;
            var itemsCount = eval( $scope.itemsTable );
            for( var i = 0; i < itemsCount.length; i++ ) {
                if( itemsCount[i].dataID === dataID ) {
                    index = i;
                    break;
                }
            }
            if( index === -1 ) {
                alert( "Something gone wrong" );
            }
            else {
                    $scope.itemsTable.splice(index, 1);
                    var getRemainingBudget = $.param({id: ID});
                    $http.post("http://papael.com/ShoppingApp/getRemaining.php", getRemainingBudget).then(function (response) {
                        if(response.data.records && response.data.records.length > 0){
                            $scope.remaining = response.data.records[0].remaining;
                        }
                        else
                        {
                            $scope.remaining = $scope.balance;
                        }

                        if($scope.remaining < 0)
                        {
                            $("#ExceedingBalancePopup").popup("open");
                        }
                    }, function errorRetreivingRemainingBudget(response) {
                        alert( "Something gone wrong" );
                    });
            }
        });
    };

    $scope.clearList = function() {
            var idDetails = $.param({ id : ID});
            $http.post("http://papael.com/ShoppingApp/clearAll.php",idDetails).then(function(response) {
                var itemsCount = eval($scope.itemsTable);
                if(itemsCount != null)
                {
                    if(itemsCount.length > 0) {
                        $scope.itemsTable.splice(0,itemsCount.length);
                        var getRemainingBudget = $.param({id: ID});
                        $http.post("http://papael.com/ShoppingApp/getRemaining.php", getRemainingBudget).then(function (response) {
                            if (response.data.records && response.data.records.length > 0) {
                                $scope.remaining = response.data.records[0].remaining;
                            }
                            else {
                                $scope.remaining = $scope.balance;
                            }
                        }, function ErrorGettingRemainedBudget(response) {

                        });
                    }
                }
                $("#ClearListPopup").popup("close");
            }, function ErrorClearingList(response) {
                    alert( "Something gone wrong" );
                });
    };

    $scope.AddItem = function() {
           var AddItemData = $.param({ id : ID , date : $scope.Date , itemType : $scope.ItemName , itemDescription : $scope.ItemDescription , amount : $scope.Amount , price : $scope.Price});
           //$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
           $http.post("http://papael.com/ShoppingApp/addItem.php",AddItemData).then(function(response) {
               $scope.itemsTable.push({ Date :  $scope.Date , itemType : $scope.ItemName , itemDescription : $scope.ItemDescription , amount : $scope.Amount , price : $scope.Price , dataID : response.data.records[0].dataID });
               $scope.Date = null;
               $scope.ItemName = "Select";
               $scope.ItemDescription = null;
               $scope.Amount = null;
               $scope.Price = null;
               var getRemainingBudget = $.param({ id : ID });
                $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
                $http.post("http://papael.com/ShoppingApp/getRemaining.php",getRemainingBudget).then(function(response) {
                  $scope.remaining = response.data.records[0].remaining;
                   if($scope.remaining < 0)
                   {
                       $("#ExceedingBalancePopup").popup("open");
                   }
               }, function errorRetreivingRemainingBudget(response) {
                    alert( "Something gone wrong" );
               });
               $scope.AddItemPage = false;
               $scope.connected = true;
            }, function ErrorAddItem(response) {
                   alert( "Something gone wrong" );
               });
    };

    /**
     * @return {boolean}
     */
    $scope.CheckAddItemFields = function() {
        if($scope.ItemName != "Select" && $scope.ItemDescription != null && $scope.Amount != null && $scope.Price != null && $scope.Date != null)
        {
            return false;
        }
        else
        {
            return true;
        }
    };

    /**
     * @return {number}
     */
    $scope.CalculateTotalAmount = function() {
        if($scope.Amount == null || $scope.Price == null)
        {
            return 0;
        }
        else
        {
            return ($scope.Amount*$scope.Price);
        }
    };


    /**
     * @return {boolean}
     */
    $scope.CheckAllFields = function() {
      if($scope.SignUpEmailInput != null && $scope.SignUpPasswordInput && $scope.SignUpConfirmPasswordInput != null && $scope.SignUpFullNameInput!= null)
      {
          if($scope.SignUpPasswordInput == $scope.SignUpConfirmPasswordInput)
          {
              return false;
          }
          else
          {
              //TODO: Make a red border box on the Confirm Password
          }
      }
        return true;
    };

    $scope.SignUp = function() {
        $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
        var UserDetails = $.param({ email : $scope.SignUpEmailInput , password : $scope.SignUpPasswordInput , user : $scope.SignUpFullNameInput });
        //$http.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
        $http.post("http://papael.com/ShoppingApp/addUser.php",UserDetails).then(function(response) {
            if(response.data.records.length > 0)
            {
                $scope.SignUpEmailInput = null;
                $scope.SignUpPasswordInput = null;
                $scope.SignUpConfirmPasswordInput = null;
                $scope.SignUpFullNameInput = null;
                $scope.signUpUserName = response.data.records[0].username;
                $("#SignUpSuccessfullyPopup").popup("open");
            }
            else
            {
                alert("Something went wrong!");
            }
        }, function ErrorUpdatingServer(response) {
            alert("Something went wrong!");
        });

        };

    var options = {
        'legend':'top',
        'title':'Expenses at last 5 Days'
    };

    function drawChart() {
        // Define the chart to be drawn.
        if (ID != null)
        {
            var TotalExpensesByDate = $.param({id: ID});
            $http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
            $http.post("http://papael.com/ShoppingApp/getChart.php", TotalExpensesByDate).then(function (response) {
                if (response.data.records.length != 0) {
                    var dataSizeForChart = 0;
                    var data = new google.visualization.DataTable();
                    data.addColumn('string', 'Date');
                    data.addColumn('number', 'Spent today');
                    if (response.data.records.length < 5) {
                        dataSizeForChart = response.data.records.length;
                    }
                    else {
                        dataSizeForChart = 5;
                    }
                    data.addRows(dataSizeForChart);
                    for (var i = 0; i < dataSizeForChart; i++) {
                        data.setCell(i, 0, response.data.records[i].date);
                        data.setCell(i, 1, response.data.records[i].totalExpends);
                    }


                    var chart = new google.visualization.ColumnChart(document.getElementById('myColumnChart'));
                    chart.draw(data, options);
                }
            }, function ErrorLoadingChartData(response) {
                alert( "Something gone wrong" );
            });
        }

    };


    $scope.GoBackToMainScreenFromChartPage = function() {
        $scope.ChartPage = false;
        $scope.connected = true;
    };

    $scope.CloseExceedingBalancePopup = function() {
        $("#ExceedingBalancePopup").popup("close");
    };


    $scope.OpenPanel = function() {
        $("#SettingsPanel").panel("open");
    };

    $scope.OpenAboutPopup = function() {
        $("#SettingsPanel").panel("close");
        $("#AboutPopup").popup("open");
    };

    $scope.CloseAboutPopup = function() {
        $("#AboutPopup").popup("close");
    };

    $scope.OpenClearListPopup = function() {
        $("#SettingsPanel").panel("close");
        $("#ClearListPopup").popup("open");
    };

    $scope.closeSetAccountBalance = function() {
        $("#SetAccoutBalancePopup").popup("close");
    };

    $scope.ShowAddItemPage = function() {
        $scope.connected = false;
        $scope.AddItemPage = true;
    };

    $scope.BackToLoginScreen = function() {
        $scope.connected = false;
        $scope.LoginPage = true;
        location.reload();
    };

    $scope.closeClearListPopup = function() {
        $("#ClearListPopup").popup("close");
    };

    $scope.CloseErrorPopup = function() {
        $("#InvalidEmailOrPassword").popup("close");
    };

    // Go To Main Screen from Add Item Page
    $scope.GoBackToMainScreen = function() {
        $scope.AddItemPage = false;
        $scope.connected = true;
    };

    // Go To Diagram Page
    $scope.GoToDiagramPage = function() {
        $("#SettingsPanel").panel("close");
        $scope.connected = false;
        $scope.ChartPage = true;
        drawChart();
    };

    $scope.OpenSetAccountBalancePopup = function() {
        $("#SettingsPanel").panel("close");
        $("#SetAccoutBalancePopup").popup("open");
    };

    $scope.GoBackToLoginScreenFromSignUp = function() {
        $("#SignUpSuccessfullyPopup").popup("close");
        $scope.SignUpPage = false;
        $scope.LoginPage = true;
    };


    $scope.ReturnToLoginPage = function() {
        $scope.SignUpPage = false;
        $scope.LoginPage = true;
    };

    $scope.ClosePanel = function() {
        $("#SettingsPanel").panel("close");
    };

    $scope.GoToSignUpPage = function() {
        $scope.LoginPage = false;
        $scope.SignUpPage = true;
    };


}]);  // End of controller

function CloseAllPopupsForExit() {
    $('[data-role="popup"]').popup("close");
    $("#SettingsPanel").panel("close");
}