// Unmodified rule and narrative block from user-provided v0.7.1 HTML. Test-only reference.
const KEY='crywolf_boundary_experiment_v07';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const fresh=()=>({version:7,phase:'title',stage:'intro',beat:0,trust:3,bond:0,insight:0,ticks:0,notes:[],history:[],flags:{n1:null,held2:false,n2:null,village3:false,forest3:false,talk3:false,agreement3:false,n3:null},observe:'',result:null,help:false,mute:true});
let g=fresh();
let menuOpen=false;
let hasSave=false;try{hasSave=!!localStorage.getItem(KEY)}catch(e){}
function save(){try{localStorage.setItem(KEY,JSON.stringify(g));hasSave=true}catch(e){}}
function restore(){try{const s=JSON.parse(localStorage.getItem(KEY));if(s?.version===7&&s?.flags&&s?.phase){g={...fresh(),...s,help:false};return true}}catch(e){}return false}
function newRun(){menuOpen=false;g=fresh();g.phase='story';g.stage='intro';save();render()}
function go(stage){g.stage=stage;g.beat=0;g.phase='story';g.observe='';g.result=null;if(stage==='night2')g.ticks=2;if(stage==='night3'){g.ticks=3;if(g.flags.n1==='ring'){g.flags.village3=true;g.notes.push({stage:3,action:'n1-ring',info:'第一夜の正しい警報を評価し、村長が古地図を預けてくれた。羊小屋は西、迂回路は東の丘。'});}else if(g.flags.n1==='hide'){g.flags.forest3=true;g.notes.push({stage:3,action:'n1-hide',info:'第一夜の秘密の会話を覚えたルナが、仲間は古い泉へ通う必要があると打ち明けた。東の丘も通れる。'});}}save();render()}
const scripts={
intro:[
 {art:'fable',cast:'none',label:'むかし、ひとつの嘘',speaker:'語り手',text:'何度も「オオカミだ！」と嘘をついた少年は、ほんとうに助けが必要な夜、誰にも信じてもらえませんでした。'},
 {art:'village',cast:'bell',bell:'serious',label:'ベルの仕事',speaker:'村長',text:'「ベル。狼が〈見張り道の内側〉に入ったら、鐘で知らせなさい。正しい警報は仕事。誤報や隠し事は村の信用を傷つける」'},
 {art:'border',cast:'bell',bell:'think',label:'七夜後、道は閉じる',speaker:'ベル',text:'羊を守るため、村は七夜後に森の古道を柵で閉ざすらしい。\n「森には森の暮らしもあるのに……でも、僕は村の番犬だから」'}],
night1:[
 {art:'border',cast:'both',bell:'shy',luna:'challenge',label:'第一夜・境界を越える狼',speaker:'ルナ',text:'「へえ、新入りの番犬？ あんたたち、勝手に森への道を閉じるんですってね」\nベル「あなた、もう見張り道の内側です！」'},
 {art:'border',cast:'both',bell:'serious',luna:'smirk',label:'鐘を鳴らす理由',speaker:'ルナ',text:'「じゃあ鳴らせば？ 私は許しをもらいに来たんじゃない」\nベル「……それでも、理由くらい聞きたいです」',hint:'ルナが見張り道を越えたのは確定。鐘を鳴らすのは正しい警報。隠す場合、翌朝の足跡から発覚します。'}],
night2:[
 {art:'evening',cast:'both',bell:'think',luna:'smirk',label:'第二夜・負けず嫌い',speaker:'ルナ',text:'「今日は行かない。……道を閉じるなら、別の通り方を考えるだけよ」\nベル「また見張り道へ来るんですか？」\nルナ「知りたければ、ちゃんと見張ってなさい」'},
 {art:'tower',cast:'bell',bell:'think',label:'遠吠えと足跡',speaker:'ベル',text:'森から長い遠吠えが一声。入口に足跡。\nルナの言葉と、夜の気配。いまどこにいるんだろう？',hint:'2刻だけ行動できる。1刻目は声が遠く、ランタンの合図は届かない。2刻目は境界に近づき、届く距離になる。'}],
night3:[
 {art:'village',cast:'bell',bell:'serious',label:'第三夜・村の柵',speaker:'村長',text:'「羊を守る柵は、四夜後に設置する予定だ。古道を通る狼が増えれば心配だ。ベル、夜番として何か知っているか？」'},
 {art:'forest',cast:'luna',luna:'guarded',label:'第三夜・森の約束',speaker:'ルナ',text:'「村の犬なんかに頼らない。森の仲間の通り道は、私が守る」\n言い切ったあと、ルナは古い道しるべをじっと見ていた。',hint:'村が柵を望む理由と、ルナが古道を必要とする理由は別かもしれない。残り3刻。'}]
};
const stageInfo={intro:{title:'むかしばなし',short:'PROLOGUE',next:'night1'},night1:{title:'月の下の客',short:'NIGHT 1',next:'night2'},night2:{title:'境界で待って',short:'NIGHT 2',next:'night3'},night3:{title:'二つの道',short:'NIGHT 3'}};
function introDetail(){return g.flags.n1==='ring'?'「仕事は仕事、ね。……次は出し抜いてやる」 ルナは少し不機嫌だ。':'「村にばれたんでしょ。……私のために嘘つかなくていいのよ」 ルナはそっぽを向いた。'}
function result(text,reason,delta={},meta={}){const before={trust:g.trust,bond:g.bond,insight:g.insight};for(const k of Object.keys(before))g[k]=clamp(g[k]+(delta[k]||0),0,k==='trust'?5:k==='bond'?5:3);g.result={text,reason,before,after:{trust:g.trust,bond:g.bond,insight:g.insight},...meta};g.history.push({night:g.stage,code:meta.code,delta,trust:g.trust,bond:g.bond,insight:g.insight});g.phase='result';save();render()}
function night1Choice(id){if(g.phase!=='choice1')return;if(id==='ring'){
 g.flags.n1='ring';result('カラン！ 村人が集まり、ルナは境界の外へ引き返した。\nルナ「ちっ。ちゃんと鳴らすのね。……あんたのこと、覚えたわ」','オオカミが見張り道にいたので、正しい警報。村の信用が上がった。',{trust:1},{code:'ring',art:'bell',cast:'both',bell:'serious',luna:'challenge'});
 }else{
 g.flags.n1='hide';result('ベル「……道を閉じる話、何か知ってるんですか？」\nルナ「森にだって、守りたいものがあるってこと」\n翌朝、足跡と報告が食い違い、村長は顔を曇らせた。','ルナと話せたが、見張り道へ入った狼を隠したことが発覚した。',{trust:-1,bond:1},{code:'hide',art:'border',cast:'both',bell:'shy',luna:'smirk'});
 }}
function do2(id){if(g.phase!=='explore2'||g.ticks<=0)return;let time=g.ticks;g.ticks--;let text='';
 if(id==='track')text=time===2?'小さなウサギの足跡と、森の側に止まった大きな狼の足跡。境界線の内側には、まだない。':'狼の足跡は境界線の直前。今にも越えそうだ。';
 if(id==='listen')text=time===2?'遠吠えはまだ森の奥。あの声は、こちらへゆっくり近づいてくる。':'近い足音。「……こんな犬っころを待つなんて」と小声が聞こえた気がした。';
 if(id==='signal'){
  if(time===2){text='二回、灯りを遮った。でもルナは遠すぎた。森から返事はない。';}
  else{g.flags.held2=true;text='光が二回、森へ届く。短い遠吠えが返った。……足音が止まった。\nルナは境界の外で待つことにしたようだ。';}
 }
 if(g.ticks===0&&!g.flags.held2)text+='\n最後の刻。待ちきれないルナが見張り道の内側へ足を踏み入れた。';
 g.observe=text;g.notes.push({stage:2,action:id,info:text});g.phase='observe2';save();render()}
function report2(id){if(g.phase!=='report2')return;const held=g.flags.held2;const code=held?(id==='silent'?'best':'false'):(id==='ring'?'duty':'miss');g.flags.n2=code;
 if(code==='best')result('交代のあと、境界の外で腕組みをするルナ。\n「……遅い！ 犬っころのくせに。待ったんじゃなくて、私が選んでここにいたの！」','調査と合図でルナは道に入らなかった。正しく「異常なし」と報告できた。二人だけの合図が通じた。',{bond:1,insight:1},{code,art:'border',cast:'both',bell:'smile',luna:'guarded'});
 if(code==='false')result('鐘の音に村人が集まった。けれどルナは境界の外で待っていた。\nベル「僕、慌ててしまった……」','ルナが道に入っていないのに警報を出した。誤報で信用を失った。',{trust:-2},{code,art:'bell',cast:'bell',bell:'shy'});
 if(code==='duty')result('ルナは待ちきれず、見張り道へ。ベルは正しく鐘を鳴らした。\nルナ「……仕事は捨てないのね。仕方ない、今日は引いてあげる」','狼が道に入ったので正しい警報。村の信用は上がり、ルナとの合図はまだ成立していない。',{trust:1},{code,art:'bell',cast:'both',bell:'serious',luna:'guarded'});
 if(code==='miss')result('交代までベルは黙っていた。翌朝、見張り道に狼の足跡。\n村長「ベル、報告は『異常なし』だったね？」','ルナは見張り道へ入った。見逃しが発覚して信用を失った。',{trust:-1,bond:1},{code,art:'village',cast:'bell',bell:'shy'});
}
function act3(id){if(g.phase!=='explore3'||g.ticks<=0)return;g.ticks--;let info='';
 if(id==='village'){
  g.flags.village3=true;info='村の古地図。羊小屋は西。問題の古道は東の丘にも分かれている。\n村人が欲しいのは「狼を困らせること」ではなく、「羊小屋から離れた安全な通行」だ。';
 } else if(id==='forest'){
  g.flags.forest3=true;info='森の足跡は古い泉へ続く。乾季には森の仲間が泉へ通う必要がある。\n東の丘なら羊小屋を通らず泉へ行ける。ルナは一人のために道を求めていたのではなかった。';
 } else if(id==='speak'){
  g.flags.talk3=true;info='ルナ「オオカミはみんな羊を狙う？ ……そんなに暇じゃないわよ。森の泉へ行く道が要るだけ」\nベル「そういうことなら、村の人にも話せるかも」\nルナ「……頼んでない！」';
 } else if(id==='signal'){
  if(g.flags.village3&&g.flags.forest3&&g.flags.held2){g.flags.agreement3=true;info='古地図の東の丘を指し、ランタンを二度遮った。ルナから短い返事。\nルナ「そこなら森の子たちも通れる……。ふん、悪くない考えね、ベル」';}
  else if(!g.flags.held2)info='灯りを二度遮る。でも昨日の合図がまだ通じていない。ルナは返事をせず、立ち去った。\n今夜は村へ分かった事実を伝える方法が残っている。';
  else info='合図は届いたけれど、まだ行き先の説明が足りない。ルナは首をかしげている。\nどちらの立場も知らなければ、提案は作れない。';
 }
 g.observe=info;g.notes.push({stage:3,action:id,info});g.phase='observe3';save();render()}
function report3(id){if(g.phase!=='report3')return;
 let f=g.flags;let code=id;f.n3=code;
 if(id==='proposal'){
  if(!(f.village3&&f.forest3&&f.agreement3))return;
  result('ベル「羊小屋から離れた東の丘を、森の通り道にできませんか」\n村長「古地図にも載っているね。相談してみよう」\nルナ「……べつに、あんたに頼ったわけじゃないから！」','村の安全、森の泉、ルナの同意がそろった。新たな通行路の話し合いが始まった。',{trust:1,bond:2,insight:1},{code,art:'border',cast:'both',bell:'smile',luna:'smirk'});
 }else if(id==='facts'){
   const both=f.village3&&f.forest3;
   result(both?'ベルは古地図と足跡を村長に示した。\n村長「一度、現地を確かめてみよう」\nルナ「……正面から話すなんて、変な犬」':'ベルは自分の見た事実だけを伝えた。\n村長「それなら調べてみよう。分からないところは、分からないと言えばいい」','分かったことを正直に報告した。合意はまだないが、話し合いの余地ができた。',{trust:1,bond:both?1:0},{code,art:'village',cast:'bell',bell:'serious'});
 }else if(id==='false'){
  result('ベルは「オオカミが道に入りました！」と鐘を鳴らした。\n村人が確かめても、道の内側には誰もいなかった。\nルナ「……あんた、そんな嘘をつく犬だった？」','道に入った狼を確認していないのに鐘を鳴らした。誤報で信用が下がった。',{trust:-2,bond:-1},{code,art:'bell',cast:'bell',bell:'shy'});
 }else if(id==='secret'){
  result('ベルは何も報告しなかった。ルナは境界の外から村の柵を見ている。\n「……誰も動かないなら、私が一人でやるだけよ」','その場は穏やかでも、道を閉じる計画は進む。ベルもルナも相手に働きかけられなかった。',{}, {code,art:'forest',cast:'luna',luna:'guarded'});
 }}
