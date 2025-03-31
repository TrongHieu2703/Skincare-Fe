import React from "react";
import { useParams } from "react-router-dom";
import "/src/styles/BlogDetail.css";

const blogPosts = [
    {
        id: 1,
        title: "10 loại kem mắt tốt nhất được bác sĩ Joel và Daniel Schlessinger khuyên dùng",
        description: "Giảm nếp nhăn, bọng mắt và quầng thâm nhờ những dòng kem mắt được khuyên dùng bởi bác sĩ da liễu hàng đầu.",
        content: `
    Vùng da quanh mắt là khu vực rất mỏng manh và nhạy cảm, dễ bị tổn thương bởi ánh nắng mặt trời, ô nhiễm, mất ngủ hoặc quá trình lão hóa tự nhiên. Đây cũng là nơi đầu tiên xuất hiện các dấu hiệu tuổi tác như nếp nhăn, vết chân chim, bọng mắt hay quầng thâm. Chính vì vậy, việc chăm sóc vùng da mắt sớm và đúng cách là rất quan trọng để giữ cho khuôn mặt luôn trẻ trung và tươi tắn.
    
    Bác sĩ Joel và Daniel Schlessinger – hai chuyên gia da liễu nổi tiếng tại Hoa Kỳ – đã đề xuất 10 loại kem mắt được đánh giá cao cả về hiệu quả và độ an toàn. Các sản phẩm này được lựa chọn dựa trên thành phần có khả năng dưỡng ẩm sâu, làm sáng vùng da dưới mắt, kích thích sản sinh collagen và giảm các dấu hiệu mệt mỏi.
    
    Danh sách gồm các sản phẩm sau:
    
    1. Obagi ELASTIderm Eye Cream: Sản phẩm chứa bi-mineral complex giúp tăng cường độ đàn hồi cho vùng da mắt, cải thiện nếp nhăn và độ săn chắc rõ rệt chỉ sau vài tuần sử dụng.
    
    2. SkinCeuticals A.G.E. Eye Complex: Đây là lựa chọn lý tưởng cho người có nếp nhăn sâu và quầng thâm lâu năm. Công thức giàu flavonoid và peptide giúp làm đầy rãnh nhăn, đồng thời làm sáng da.
    
    3. Neocutis Lumiere Firm: Với thành phần chứa peptides, caffeine và hyaluronic acid, sản phẩm giúp giảm bọng mắt, làm dịu vùng da bị kích ứng và tăng cường độ ẩm nhanh chóng.
    
    4. iS Clinical Eye Complex: Đây là kem mắt đa năng với khả năng dưỡng ẩm mạnh, chống oxy hóa và làm đều màu da. Thích hợp với người có quầng thâm do sắc tố hoặc do mạch máu.
    
    5. La Roche-Posay Pigmentclar Eyes: Một lựa chọn phổ biến tại các hiệu thuốc, chứa caffeine và niacinamide giúp làm sáng vùng da thâm sạm và giảm sưng bọng mắt hiệu quả.
    
    6. CeraVe Eye Repair Cream: Dành cho da nhạy cảm, sản phẩm không chứa hương liệu và paraben, cung cấp độ ẩm cần thiết và giúp phục hồi hàng rào bảo vệ tự nhiên của da.
    
    7. Murad Retinol Youth Renewal Eye Serum: Chứa retinol thế hệ mới giúp kích thích sản sinh collagen, làm mờ nếp nhăn và cải thiện độ đàn hồi mà không gây kích ứng.
    
    8. Kiehl’s Creamy Eye Treatment with Avocado: Sản phẩm nổi tiếng với kết cấu mềm mịn, cấp ẩm sâu và thích hợp với mọi loại da, kể cả da khô hay da mất nước.
    
    9. The Ordinary Caffeine Solution 5% + EGCG: Mặc dù giá thành rất phải chăng, sản phẩm này vẫn mang lại hiệu quả giảm bọng mắt và làm sáng quầng thâm nhờ nồng độ caffeine cao và chiết xuất trà xanh.
    
    10. Drunk Elephant C-Tango Multivitamin Eye Cream: Sản phẩm chứa nhiều loại vitamin C kết hợp peptide giúp cải thiện tổng thể vùng da mắt, làm sáng và tăng độ đàn hồi.
    
    Khi sử dụng kem mắt, bạn nên dùng ngón áp út để lấy một lượng nhỏ và vỗ nhẹ lên vùng da dưới mắt. Không nên kéo hoặc chà xát mạnh vì có thể làm tổn thương da. Tốt nhất nên sử dụng sản phẩm cả vào buổi sáng và tối để đạt hiệu quả tối ưu.
        `,
        image: "/src/assets/images/blog1.jpg",
        category: "Chăm Sóc Da",
        date: "Feb 14, 2025"
    },

    {
        id: 2,
        title: "Toner là gì? Cách chọn toner phù hợp với từng loại da",
        description: "Toner là bước chăm sóc da không thể thiếu giúp cân bằng pH, làm sạch sâu và chuẩn bị da cho các bước dưỡng tiếp theo.",
        content: `
    Toner là sản phẩm dạng lỏng được sử dụng ngay sau bước làm sạch da nhằm mục đích cân bằng độ pH, loại bỏ cặn bẩn còn sót lại và giúp da hấp thụ dưỡng chất tốt hơn ở các bước sau. Trong quá khứ, toner thường được biết đến với tên gọi “nước hoa hồng”, chủ yếu dành cho da dầu hoặc da mụn. Tuy nhiên, toner ngày nay đã phát triển đa dạng về công thức và công dụng, phù hợp với mọi loại da.
    
    Một số công dụng chính của toner hiện đại bao gồm:
    
    Giúp cân bằng độ pH cho da sau khi rửa mặt, đặc biệt khi dùng các loại sữa rửa mặt có độ kiềm cao.
    
    Làm sạch sâu và loại bỏ bụi bẩn, cặn trang điểm còn sót lại sau bước tẩy trang.
    
    Cấp ẩm tức thì, làm dịu da và giảm cảm giác khô căng.
    
    Hỗ trợ thu nhỏ lỗ chân lông và chuẩn bị cho bước dưỡng tiếp theo.
    
    Đối với da dầu hoặc da dễ nổi mụn, nên chọn các loại toner có chứa thành phần kháng khuẩn như witch hazel, tea tree oil hoặc salicylic acid. Những thành phần này giúp làm sạch sâu và kiểm soát bã nhờn hiệu quả.
    
    Da khô sẽ phù hợp với toner chứa thành phần cấp ẩm như hyaluronic acid, glycerin hoặc chiết xuất hoa cúc. Những thành phần này giúp duy trì độ ẩm và làm dịu vùng da nhạy cảm.
    
    Da hỗn hợp nên sử dụng các loại toner cân bằng giữa cấp nước và kiểm soát dầu, có thể dùng dạng không cồn để tránh gây kích ứng.
    
    Còn với da nhạy cảm, hãy chọn toner không chứa hương liệu và cồn, ưu tiên chiết xuất từ thiên nhiên như lô hội hoặc trà xanh giúp làm dịu và phục hồi da.
    
    Cách sử dụng toner cũng rất quan trọng. Sau khi rửa mặt, hãy thấm toner vào bông tẩy trang rồi lau nhẹ nhàng khắp mặt. Ngoài ra, có thể đổ toner ra tay rồi vỗ nhẹ lên da để tăng khả năng thẩm thấu. Với những loại toner dưỡng ẩm, bạn có thể áp dụng phương pháp “7 skin method” – vỗ 7 lớp toner liên tiếp để cấp ẩm sâu cho làn da khô.
    
    Hãy nhớ rằng toner không phải là bước bắt buộc, nhưng nếu được chọn đúng và dùng đúng cách, nó sẽ là trợ thủ đắc lực trong quá trình chăm sóc da hàng ngày.
        `,
        image: "/src/assets/images/blog2.png",
        category: "Chăm Sóc Da",
        date: "Feb 16, 2025"
    },
    {
        id: 3,
        title: "Cách xây dựng chu trình skincare buổi tối đơn giản và hiệu quả",
        description: "Một chu trình chăm sóc da buổi tối khoa học giúp tái tạo làn da sau một ngày dài tiếp xúc môi trường.",
        content: `
    Skincare buổi tối không chỉ đơn thuần là làm sạch da, mà còn là lúc lý tưởng để nuôi dưỡng và phục hồi làn da sau một ngày dài tiếp xúc với ánh nắng, bụi bẩn và ô nhiễm môi trường. Một chu trình chăm sóc da ban đêm được thiết kế đúng sẽ giúp bạn thức dậy với làn da căng bóng, mịn màng và khỏe mạnh.
    
    Bước đầu tiên trong chu trình là tẩy trang. Dù bạn có trang điểm hay không, lớp kem chống nắng và bụi bẩn vẫn bám trên da cả ngày. Dùng dầu hoặc nước tẩy trang để làm sạch lớp cặn bẩn mà sữa rửa mặt không thể loại bỏ hoàn toàn.
    
    Tiếp theo là rửa mặt bằng sữa rửa mặt phù hợp với loại da. Với da dầu, chọn loại gel tạo bọt nhẹ để làm sạch sâu. Với da khô, ưu tiên sản phẩm dịu nhẹ có độ ẩm cao.
    
    Sau khi rửa mặt, hãy dùng toner để cân bằng độ pH và giúp da hấp thụ dưỡng chất tốt hơn.
    
    Bước serum là bước quan trọng giúp giải quyết các vấn đề cụ thể như da sạm màu, mất nước, mụn hoặc lão hóa. Serum chứa hàm lượng dưỡng chất cao và thấm nhanh vào da, vì vậy hãy chọn loại phù hợp với tình trạng da hiện tại.
    
    Tiếp theo là kem mắt, giúp ngăn ngừa nếp nhăn, giảm quầng thâm và bọng mắt – những dấu hiệu thường thấy do thiếu ngủ và mệt mỏi.
    
    Cuối cùng là kem dưỡng ẩm ban đêm hoặc sleeping mask. Kem dưỡng giúp khóa ẩm, giữ lại các dưỡng chất từ các bước trước đó và phục hồi làn da suốt đêm.
    
    Ngoài ra, đừng quên làm sạch cọ trang điểm mỗi tuần, thay vỏ gối thường xuyên và tránh thức khuya để tối ưu hóa hiệu quả skincare. Chỉ cần 15-20 phút mỗi tối để chăm sóc da đúng cách, bạn sẽ thấy sự thay đổi rõ rệt chỉ sau vài tuần.
        `,
        image: "/src/assets/images/blog3.avif",
        category: "Skincare Routine",
        date: "Feb 18, 2025"
    },
    {
        id: 4,
        title: "Da dầu có cần dưỡng ẩm không? Những hiểu lầm thường gặp",
        description: "Nhiều người da dầu thường bỏ qua bước dưỡng ẩm, tuy nhiên điều này có thể khiến da tiết dầu nhiều hơn.",
        content: `
    Một quan niệm sai lầm rất phổ biến là người có làn da dầu không cần dưỡng ẩm vì sợ làm da bóng nhờn hơn. Tuy nhiên, đây lại là nguyên nhân chính khiến da tiết dầu nhiều hơn để bù đắp lượng nước bị thiếu hụt. Dưỡng ẩm là một bước thiết yếu đối với mọi loại da, kể cả da dầu.
    
    Khi da không được cấp đủ ẩm, tuyến bã nhờn sẽ hoạt động mạnh để bảo vệ lớp màng ẩm tự nhiên, gây nên tình trạng bóng dầu, lỗ chân lông to và dễ nổi mụn. Vì thế, thay vì bỏ qua dưỡng ẩm, bạn nên chọn sản phẩm phù hợp để cân bằng độ ẩm một cách hợp lý.
    
    Đối với da dầu, hãy ưu tiên các loại kem dưỡng có kết cấu mỏng nhẹ, nhanh thấm, không chứa dầu và có nhãn “non-comedogenic” để không gây bít tắc lỗ chân lông. Dạng gel hoặc lotion thường phù hợp hơn so với dạng kem đặc.
    
    Một số thành phần dưỡng ẩm lý tưởng cho da dầu bao gồm:
    
    Niacinamide: giúp điều tiết dầu, làm sáng da và thu nhỏ lỗ chân lông.
    
    Hyaluronic Acid: cấp nước mạnh mẽ mà không gây bít da.
    
    Aloe Vera (nha đam): làm dịu và cung cấp độ ẩm nhẹ nhàng.
    
    Glycerin: hút ẩm từ môi trường để nuôi dưỡng da hiệu quả.
    
    Bạn nên sử dụng kem dưỡng ẩm 2 lần mỗi ngày, sau bước serum. Nếu cảm thấy da quá bóng vào ban ngày, có thể dùng sản phẩm có kết cấu dạng nước hoặc lotion nhẹ nhàng.
    
    Ngoài ra, hãy chú ý đến các yếu tố như độ ẩm trong phòng, thời gian ngủ nghỉ và chế độ ăn uống. Da dầu có thể trở nên khỏe mạnh và ít mụn nếu được dưỡng ẩm đúng cách và duy trì thói quen chăm sóc đều đặn mỗi ngày.
        `,
        image: "/src/assets/images/blog4.webp",
        category: "Chăm Sóc Da",
        date: "Feb 19, 2025"
    },
    {
        id: 5,
        title: "Chăm sóc da trong thời đại mới: Khoa học kết hợp công nghệ",
        image: "/src/assets/images/blog5.png",
        description: "Khám phá cách công nghệ hiện đại đang làm thay đổi hoàn toàn thế giới chăm sóc da, từ AI phân tích da cho đến cá nhân hóa theo DNA và ứng dụng thiết bị thông minh.",
        content: `
      Chăm sóc da ngày nay không còn là hành động mang tính cảm tính hay chỉ dựa vào thói quen truyền thống. Với sự tiến bộ của khoa học và công nghệ, ngành công nghiệp làm đẹp đang dần bước vào một kỷ nguyên mới – nơi mọi sản phẩm và quy trình chăm sóc da đều có thể được đo lường, phân tích và tối ưu hoá một cách khoa học và cá nhân hoá.
      
      Trong thế giới hiện đại, trí tuệ nhân tạo (AI) đã và đang giữ vai trò trung tâm trong việc cá nhân hóa chăm sóc da. Thay vì phải tự đoán loại da của mình hoặc nghe tư vấn chủ quan, người dùng giờ đây có thể sử dụng các ứng dụng thông minh như SkinAdvisor, L’Oreal Perso hay YouCam Skin. Chỉ cần chụp một tấm hình selfie và trả lời một vài câu hỏi đơn giản, hệ thống AI có thể phân tích độ đàn hồi da, lỗ chân lông, sắc tố, nếp nhăn và mức độ tổn thương do tia UV. Thông tin này sau đó được dùng để đề xuất chu trình chăm sóc cá nhân hoá, từ loại sữa rửa mặt cho đến kem chống nắng và serum đặc trị.
      
      Song song với AI, công nghệ liposome đã đánh dấu bước đột phá trong việc tăng hiệu quả của các thành phần hoạt tính. Trước đây, nhiều dưỡng chất có giá trị cao như retinol, niacinamide hay vitamin C thường bị phân huỷ hoặc không thể thẩm thấu sâu vào da. Nhờ liposome – các hạt dẫn truyền siêu nhỏ có cấu trúc tương tự màng tế bào – các hoạt chất này được bảo vệ và đưa vào sâu hơn trong lớp biểu bì, giúp tối ưu hiệu quả mà vẫn đảm bảo độ an toàn. Sự xuất hiện của các sản phẩm ứng dụng công nghệ này đang dần thay thế các sản phẩm dưỡng truyền thống vốn có hiệu quả chậm và dễ gây kích ứng.
      
      Một xu hướng đặc biệt đáng chú ý khác là chăm sóc da dựa trên phân tích DNA. Nhiều công ty lớn trên thế giới hiện cung cấp dịch vụ xét nghiệm gen để phân tích các yếu tố di truyền có liên quan đến làn da, bao gồm khả năng sản sinh collagen, tốc độ lão hoá, độ nhạy cảm với ánh nắng mặt trời và khả năng đề kháng với các yếu tố môi trường. Chỉ cần gửi mẫu nước bọt hoặc tế bào niêm mạc, người dùng sẽ nhận được bản báo cáo chi tiết và kế hoạch chăm sóc da hoàn toàn phù hợp với đặc điểm sinh học riêng của mình. Đây chính là đỉnh cao của chăm sóc da cá nhân hoá – nơi không còn có khái niệm “một sản phẩm phù hợp cho tất cả”.
      
      Ngoài ra, việc phân tích hệ vi sinh vật da (microbiome) cũng đang trở thành một chủ đề nóng trong ngành mỹ phẩm. Làn da của con người là nơi sinh sống của hàng triệu vi khuẩn có lợi và có hại. Sự cân bằng của hệ sinh thái này đóng vai trò quan trọng trong việc giữ cho làn da khoẻ mạnh, chống lại các tác nhân gây mụn, viêm hoặc dị ứng. Một số thương hiệu chăm sóc da cao cấp hiện nay đang phát triển các sản phẩm chứa probiotics và prebiotics nhằm duy trì sự cân bằng của microbiome, giúp tăng cường khả năng tự phục hồi tự nhiên của da.`,
        category: "Chăm Sóc Da",
        date: "Feb 07, 2025",
    }
];

const BlogDetail = () => {
    const { id } = useParams();
    const blog = blogPosts.find((b) => b.id === parseInt(id));

    if (!blog) {
        return <div>Không tìm thấy bài viết</div>;
    }

    return (
        <div className="blog-detail-container">
            <img src={blog.image} alt={blog.title} className="blog-detail-image" />
            <h1>{blog.title}</h1>
            <p className="blog-detail-date">
                {blog.date} • {blog.category}
            </p>
            <div className="blog-detail-content">
                {blog.content || blog.description}
            </div>
        </div>
    );
};

export default BlogDetail;
