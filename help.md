## findById vs getReferenceById

getReferenceById will throw error if not exists.
findById will return a Optional<object>

普通的get/{id}请求最好用findById，如果为空就返回空值

## 数据库迁移管理

# database first

维护sql文件，每一个sql文件唯一不能更改，只能append新的sql文件修改，文件以00000_detail.
sql命名，保证顺序唯一。启动服务时候，liquibase自动同步sql文件到数据库。（包括测试库）

这样保证：数据库修改来源唯一，可以追溯记录，可以回滚。

## 集成测试

1. 使用相同的数据库（以后换成testContainer）
2. 启动时候同步数据库结构
3. 每个测试时候在beforeEach时候清空对应表数据

## dto最佳实践

1. 每个接口应该有对应的dto，定义有语义的后缀而不是Dto后缀（Request，Response），create和update的request
   payload可以考虑共用，把id放到path里。
2. 不可变的：private final Type xxxx;
3. 使用lombok的builder可以方便测试快速创建对象，但是要搭配@Jacksonized
4. 嵌套的对象需要手动加valid验证

## entity最佳实践

1. 按需集成audit类，拥有创建时间，创建人，修改时间，修改人等属性
2. 添加Version注解实现乐观锁

        @Version 
        private Long version 
3. 属性需要添加校验的注解（notBlank，size等），可以获取更清晰的错误信息。
4. 时间类型设置为 `Instant`
5. 映射关系的所有者在非`MappedBy`注解标注的表上，也就是在没有标注mappedBy
   的实体上操作增加和删除，会同步更新连接表关系。如果要在mappedBy
   的表上操作，必须查出所有拥有该实体的的实体列表，然后移除，保存后，关系会被删除，才能删除自己的实体。

## MapStruct

1. 自定义转换方法
   需要手动转换的，可以在接口里定义default方法，mapstruct会把这些方法的参数类型和目标类型对应到：源类的类型和目标类的类型去自动执行

         default Set<Tag> TagIdToTags(Set<Integer> tags) {
            Set<Tag> ans = new HashSet<>();
            for (Integer tagId : tags) {
            Tag tag = new Tag();
            tag.setId(tagId);
            ans.add(tag);
            }
            return ans;
         }

         default Set<Integer> TagsToTagId(Set<Tag> tags) {
            Set<Integer> ans = new HashSet<>();
            for (Tag tag : tags) {
            ans.add(tag.getId());
            }
            return ans;
         }

2. 循环引用(circle dependency)解决：
    1. 如果entity的manyToMany实体中mappedBy部分不需要额外的Set数据，去掉，从根本上解决问题。
    2. 在同一个mapper中单独定义list中的类型映射，并设置ignore

# jpa entityManger session JpaRepository关系

jpa和entityManger是标准，session是hibernate对entityManger的实现，JpaRepository是spring
对jpa的抽象

# 时间，时区

前端发送和接收的时间都是毫秒数。

requestDto类型：Instant
entity类型：Instant
数据库列：timestamp
responseDto类型：Instant

jackson配置： write-dates-as-timestamps: true 默认时间类型转换成epocTime
默认前端处理时区，时间戳，如果直接给前端时间字符的话，使用string类型，Instant根据目标时区转换成ZonedTime后再format。   

# 并发写同一个文件
1. 创建一个blockQueue，用一个独立线程一直读取bockQueue，一个一个的执行。

# debug用单独的配置以定制log输出
1. 定义多个yaml文件，默认是application.yaml，
可以添加application-xx.yaml
2. 通过命令行参数或环境变量或直接设置在.yaml中来决定用哪个：

   spring:
      profiles:
      active: dev  

   java -jar myapp.jar --spring.profiles.active=prod  

   export SPRING_PROFILES_ACTIVE=prod  

# 参数中--和-D区别
--用来告诉spring，spring可以解析
-D用来告诉 JVM System Properties,是一个通用的前缀：

java -jar myapp.jar --spring.profiles.active=prod

java -Dspring.profiles.active=prod -jar myapp.jar

# 设置java默认文件编码 通过jvm设置
java -Dfile.encoding=UTF-8
