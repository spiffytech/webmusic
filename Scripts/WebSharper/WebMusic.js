(function()
{
 var Global=this,Runtime=this.IntelliFactory.Runtime,alert,UI,Next,Var,Client,Doc,List,T;
 Runtime.Define(Global,{
  WebMusic:{
   Web:{
    Client:{
     Alert:function()
     {
      return alert("Clicked!");
     },
     Widget:function()
     {
      var rvInput,arg20;
      rvInput=Var.Create("");
      arg20=List.ofArray([Doc.TextNode("You typed: "),Doc.TextView(rvInput.get_View())]);
      return Doc.Concat(List.ofArray([Doc.Input(Runtime.New(T,{
       $:0
      }),rvInput),Doc.Element("p",[],arg20)]));
     }
    }
   }
  }
 });
 Runtime.OnInit(function()
 {
  alert=Runtime.Safe(Global.alert);
  UI=Runtime.Safe(Global.WebSharper.UI);
  Next=Runtime.Safe(UI.Next);
  Var=Runtime.Safe(Next.Var);
  Client=Runtime.Safe(Next.Client);
  Doc=Runtime.Safe(Client.Doc);
  List=Runtime.Safe(Global.WebSharper.List);
  return T=Runtime.Safe(List.T);
 });
 Runtime.OnLoad(function()
 {
  return;
 });
}());
