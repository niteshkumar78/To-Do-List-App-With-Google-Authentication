{
    let createItem= function(){
        let newItemForm= $('#item');
        newItemForm.submit(function(e){
            e.preventDefault();

            $.ajax({
                type: 'post',
                url: '/list',
                data: newItemForm.serialize(),
                success: function(data){
                    console.log('data', data);
                    let newPost = newPostDom(data.data.user);
                    $('#itemList').prepend(newPost);
                    deleteItems($('.delete_item_button', newPost));
                    // deleteComment($(' .delete-comment-button', newPost));
                    // createComment();
                    // $('#item input').val()=0;
                    new Noty({
                        theme: 'relax',
                        text: "Item added sucessfully!!",
                        type: 'success',
                        layout: 'topRight',
                        timeout: 1500
                        
                    }).show();

                }, error: function(error){
                    console.log(error.responseText);
                }
            });
        });
    }

    let newPostDom = function(user){
        let lastIndex= user.list.length -1;
      return $(`
      <link rel="stylesheet" href="css/styles2.css" />
  <li id='${user.list[lastIndex]}' style="list-style: none;>
        <div class="item" style= "display: flex; flex-direction: "row" >
            
       <p > <a  class="delete_item_button" href="/delete/?checkbox=${user.list[lastIndex]}">X</a> ${user.list[lastIndex]}</p>
    </div>  
</li>
`);
    }

    let deleteItems= function(){
        $('#itemList>ul>li').each(function(){
            let self = $(this);
            console.log("this",this);
            let deleteLink = $('.delete_item_button ', self);
           $(deleteLink).click(function(e){
               e.preventDefault();

               $.ajax({
                type: 'get',
                url: $(deleteLink).prop('href'),
                success: function(data){
                   console.log('ok');
                    $(`#${data.data.content}`).remove();
                    new Noty({
                        theme: 'relax',
                        text: "Post Deleted Successfully!",
                        type: 'success',
                        layout: 'topRight',
                        timeout: 1500
                        
                    }).show();
                },
                error: function(error){
                    console.log(error.responseText);
                }
            });
           })
        });
    }

    // let convertPostsToAjax = function(){
    //     $('#itemList>ul>li').each(function(){
    //         let self = $(this);
    //         console.log("this",this);
    //         let deleteButton = $('.delete_item_button ', self);
    //         deleteItems(deleteButton);

    //         // get the post's id by splitting the id attribute
            
    //     });
    // }

    createItem();
    // convertPostsToAjax();
    deleteItems();    


}